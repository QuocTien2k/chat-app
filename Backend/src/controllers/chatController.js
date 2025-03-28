const Message = require("../models/Message");

// 📌 API gửi tin nhắn
const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;

    if (!sender || !receiver || !content) {
      return res.status(400).json({ message: "Thiếu thông tin tin nhắn!" });
    }

    const message = await Message.create({ sender, receiver, content });

    // 📌 Gửi tin nhắn realtime
    const io = req.app.get("socketio");
    const onlineUsers = req.app.get("onlineUsers"); // ✅ Lấy danh sách user online
    const receiverSocketId = onlineUsers.get(receiver);

    if (receiverSocketId) {
      console.log(`📩 Gửi tin nhắn realtime đến ${receiverSocketId}`);
      io.to(receiverSocketId).emit("receiveMessage", message);
    } else {
      console.log(
        `⚠️ Người nhận ${receiver} không online, không gửi realtime.`
      );
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 API lấy tin nhắn giữa 2 user
const getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages };
