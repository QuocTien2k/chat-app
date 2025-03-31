const Message = require("../models/Message");
const mongoose = require("mongoose");

// 📌 API gửi tin nhắn
const sendMessage = async (req, res, io) => {
  try {
    let { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content.trim()) {
      return res.status(400).json({ message: "Thiếu thông tin tin nhắn!" });
    }

    const message = await Message.create({ senderId, receiverId, content });

    // 📌 Gửi tin nhắn realtime đến người nhận
    io.to(receiverId).emit("receive_message", message); // 👈 Truyền đúng event

    res.status(201).json(message);
  } catch (error) {
    console.error("Lỗi gửi tin nhắn:", error);
    res.status(500).json({ message: "Lỗi server, không thể gửi tin nhắn!" });
  }
};

// 📌 API lấy tin nhắn giữa 2 user
const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    // Kiểm tra ID hợp lệ
    if (
      !mongoose.isValidObjectId(senderId) ||
      !mongoose.isValidObjectId(receiverId)
    ) {
      return res.status(400).json({ message: "ID không hợp lệ!" });
    }

    // 📌 Truy vấn tin nhắn giữa 2 user
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: -1 }) // Tin nhắn mới nhất trước
      .populate("senderId", "name") // Lấy thông tin user gửi
      .populate("receiverId", "name") // Lấy thông tin user nhận
      .select("-__v") // Không lấy trường __v
      .lean(); // Trả về JSON thuần để tăng hiệu suất

    res.status(200).json(messages);
  } catch (error) {
    console.error("Lỗi lấy tin nhắn:", error);
    res.status(500).json({ message: "Lỗi server, không thể lấy tin nhắn!" });
  }
};

module.exports = { sendMessage, getMessages };
