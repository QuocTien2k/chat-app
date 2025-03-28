const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// 📌 Đăng ký người dùng
const registerUser = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    // Kiểm tra email hợp lệ
    if (!email.includes("@")) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải ít nhất 6 ký tự" });
    }

    // Kiểm tra email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
      status: "offline",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Đăng nhập người dùng
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    //console.log("📌 Nhận request login:", { email, password }); // 🛠 Kiểm tra dữ liệu gửi lên

    const user = await User.findOne({ email });
    if (!user) {
      //console.log("❌ Email không tồn tại:", email);
      return res
        .status(400)
        .json({ message: "Email không tồn tại trong hệ thống!" });
    }

    //console.log("✅ Tìm thấy user:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      //console.log("❌ Mật khẩu không đúng!");
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    //console.log("✅ Mật khẩu đúng! Cập nhật status online...");
    user.status = "online";
    await user.save();

    //console.log("✅ Đăng nhập thành công, gửi response...");
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Lỗi khi đăng nhập:", error); // 🛠 In lỗi chi tiết
    res.status(500).json({ message: error.message });
  }
};

// 📌 Đăng xuất người dùng
const logoutUser = async (req, res) => {
  try {
    console.log("🔍 User từ middleware:", req.user);
    const user = await User.findById(req.user.id); // Tìm user theo ID từ token
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Cập nhật trạng thái user thành offline
    user.status = "offline";
    await user.save();

    res.json({ message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 📌 Lấy danh sách tất cả Users (loại bỏ user đang đăng nhập)
const getAllUsers = async (req, res) => {
  try {
    console.log("📌 Yêu cầu lấy danh sách users...");
    console.log(
      "📌 User đang đăng nhập:",
      req.user ? req.user : "❌ Không có user!"
    );

    let users;
    if (req.user) {
      // Nếu đã đăng nhập, loại bỏ chính user đó
      users = await User.find({ _id: { $ne: req.user._id } }).select(
        "-password"
      );
    } else {
      // Nếu chưa đăng nhập, trả về toàn bộ danh sách
      users = await User.find().select("-password");
    }

    console.log("📌 Danh sách users trả về:", users);
    res.json(users);
  } catch (error) {
    console.error("❌ Lỗi Backend:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getAllUsers };
