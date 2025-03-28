const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kiểm tra user có tồn tại không
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "Người dùng không tồn tại" });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Token đã hết hạn, vui lòng đăng nhập lại" });
      }
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
  } else {
    res
      .status(401)
      .json({ message: "Không có token, không được phép truy cập" });
  }
};

const protectOptional = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  //console.log("📌 Middleware nhận Token:",token ? token : "❌ Không có token!");

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //console.log("📌 Token giải mã:", decoded);

      req.user = await User.findById(decoded.id).select("-password");
      //console.log("📌 User trong middleware:",req.user ? req.user : "❌ Không tìm thấy user!");
    } catch (error) {
      //console.error("❌ Lỗi xác thực token:", error.message);
      req.user = null; // Nếu token không hợp lệ, tiếp tục nhưng không có user
    }
  } else {
    //console.log("❌ Không có token, req.user sẽ là null!");
    req.user = null;
  }

  next();
};

module.exports = { protect, protectOptional };
