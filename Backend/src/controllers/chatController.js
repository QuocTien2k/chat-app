const Message = require("../models/Message");
const mongoose = require("mongoose");

// 📌 API gửi tin nhắn
const usersOnline = {}; // 🌐 Lưu userId -> socketId

const sendMessage = async (req, res, io) => {
  try {
    let { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content.trim()) {
      return res.status(400).json({ message: "Thiếu thông tin tin nhắn!" });
    }

    const message = await Message.create({ senderId, receiverId, content });

    // 📌 Kiểm tra xem người nhận có online không
    const receiverSocketId = usersOnline[receiverId]; // 🔹 Tìm socket của người nhận
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("❌ Lỗi gửi tin nhắn:", error);
    res.status(500).json({ message: "Lỗi server, không thể gửi tin nhắn!" });
  }
};

// 📌 API lấy tin nhắn giữa 2 user
const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

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
      .sort({ createdAt: 1 }) // 🔹 Sắp xếp theo thời gian gửi (tin cũ trước)
      .populate("senderId", "name")
      .populate("receiverId", "name")
      .select("-__v")
      .lean();

    // 📌 Đánh dấu tất cả tin nhắn từ `receiverId` đến `senderId` là "đã đọc"
    await Message.updateMany(
      { senderId: receiverId, receiverId: senderId, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Lỗi lấy tin nhắn:", error);
    res.status(500).json({ message: "Lỗi server, không thể lấy tin nhắn!" });
  }
};

module.exports = { sendMessage, getMessages };
