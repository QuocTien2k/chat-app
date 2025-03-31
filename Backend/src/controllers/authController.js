const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// 📌 Đăng ký người dùng
const registerUser = async (req, res) => {
  try {
    let { name, email, password, avatar } = req.body;
    email = email.toLowerCase().trim(); // Chuẩn hóa email

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
      avatar, // Model đã có default, không cần gán lại nếu không có
      status: "offline",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Đăng ký thất bại!" });
    }
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại!" });
  }
};

// 📌 Đăng nhập người dùng
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim(); // 📌 Chuẩn hóa email

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    user.status = "online";
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại!" });
  }
};

// 📌 Đăng xuất người dùng
const logoutUser = async (req, res) => {
  try {
    console.log("🔍 User từ middleware:", req.user); // Debug
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { status: "offline" },
      { new: true, select: "_id name status" } // 🔥 Tối ưu chỉ lấy ID, name, status
    );

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    console.log("✅ Cập nhật trạng thái offline thành công:", user);
    res.json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại!" });
  }
};

// 📌 Lấy danh sách tất cả Users (loại bỏ user đang đăng nhập)
const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user ? req.user._id : null; // 🔥 Lấy ID user nếu đăng nhập

    const users = await User.find(
      loggedInUserId ? { _id: { $ne: loggedInUserId } } : {} // Nếu có ID → Ẩn chính mình
    )
      .select("-password -__v") // Không lấy password & __v
      .sort({ createdAt: -1 }) // 🔥 Hiển thị user mới nhất trước
      .lean(); // Tăng hiệu suất

    res.json(users);
  } catch (error) {
    console.error("❌ Lỗi Backend:", error);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại!" });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getAllUsers };
