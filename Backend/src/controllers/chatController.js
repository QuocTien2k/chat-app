const Message = require("../models/Message");
const mongoose = require("mongoose");

// 📌 API gửi tin nhắn
const sendMessage = async (req, res) => {
  try {
    let { sender, receiver, content } = req.body;

    if (!sender || !receiver || !content.trim()) {
      return res.status(400).json({ message: "Thiếu thông tin tin nhắn!" });
    }

    // Kiểm tra ID hợp lệ
    if (
      !mongoose.isValidObjectId(sender) ||
      !mongoose.isValidObjectId(receiver)
    ) {
      return res.status(400).json({ message: "ID không hợp lệ!" });
    }

    // 📌 Lưu tin nhắn vào database
    const message = await Message.create({ sender, receiver, content });

    // 📌 Gửi tin nhắn realtime nếu người nhận đang online
    const io = req.app.get("socketio");
    const onlineUsers = req.app.get("onlineUsers");
    const receiverSocketId = onlineUsers.get(receiver);

    if (receiverSocketId) {
      //console.log(`📩 Gửi tin nhắn realtime đến ${receiverSocketId}`);
      io.to(receiverSocketId).emit("receiveMessage", message);
    }

    // 📌 Thông báo (chỉ emit, Frontend sẽ hiển thị thông báo)
    io.emit("newMessageNotification", { sender, receiver });

    res.status(201).json(message);
  } catch (error) {
    console.error("Lỗi gửi tin nhắn:", error);
    res.status(500).json({ message: "Lỗi server, không thể gửi tin nhắn!" });
  }
};

// 📌 API lấy tin nhắn giữa 2 user
const getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    // Kiểm tra ID hợp lệ
    if (
      !mongoose.isValidObjectId(sender) ||
      !mongoose.isValidObjectId(receiver)
    ) {
      return res.status(400).json({ message: "ID không hợp lệ!" });
    }

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 }); // Mới nhất trước

    res.status(200).json(messages);
  } catch (error) {
    console.error("Lỗi lấy tin nhắn:", error);
    res.status(500).json({ message: "Lỗi server, không thể lấy tin nhắn!" });
  }
};

module.exports = { sendMessage, getMessages };
