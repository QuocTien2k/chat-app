const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 📌 Middleware bảo vệ API
const protect = async (req, res, next) => {
  const sendError = (message) => res.status(401).json({ message }); // ✅ Hàm xử lý lỗi chung

  if (!req.headers.authorization?.startsWith("Bearer")) {
    return sendError("Không có token, không được phép truy cập");
  }

  try {
    const token = req.headers.authorization.split(" ")[1];

    // 🔥 Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Kiểm tra user có tồn tại không
    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user) return sendError("Người dùng không tồn tại");

    console.log("✅ Middleware tìm thấy user:", user);
    req.user = user; // Lưu user vào request
    next();
  } catch (error) {
    return sendError(
      error.name === "TokenExpiredError"
        ? "Token đã hết hạn, vui lòng đăng nhập lại"
        : "Token không hợp lệ"
    );
  }
};

// 📌 Middleware API công khai
const protectOptional = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  req.user = null; // Mặc định là null

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password").lean();
    } catch (error) {
      req.user = null; // Token không hợp lệ -> không có user
    }
  }

  next(); // Tiếp tục xử lý request
};

module.exports = { protect, protectOptional };
