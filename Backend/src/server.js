require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");
const socketIo = require("socket.io");
const http = require("http");
const cors = require("cors");

const app = express();
connectDB(); // Kết nối MongoDB

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", // 🔥 Chỉ cho phép frontend truy cập
    methods: ["GET", "POST"],
  },
});

// 📌 Lưu io vào app để dùng trong controller
app.set("socketio", io);

app.use(cors());
app.use(express.json()); // Middleware parse JSON

const PORT = process.env.PORT || 5000;

// 📌 Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// 📌 Quản lý user online
let onlineUsers = new Map();
app.set("onlineUsers", onlineUsers);
io.on("connection", (socket) => {
  //console.log("🟢 User connected:", socket.id);

  // 📌 User vào app sẽ gửi ID để server lưu lại
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    //console.log("User online:", onlineUsers);

    // 🔥 Thông báo user online cho tất cả client
    io.emit("updateUserStatus", { userId, status: "online" });
  });

  // 📌 Nhận tin nhắn từ client và gửi ngay đến receiver
  socket.on("sendMessage", (message) => {
    const { sender, receiver, content } = message;
    const receiverSocketId = onlineUsers.get(receiver);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", message);
    }
  });

  // 📌 Khi user rời đi
  socket.on("disconnect", () => {
    //console.log("🔴 User disconnected:", socket.id);
    let disconnectedUserId = null;

    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
      }
    });

    if (disconnectedUserId) {
      // 🔥 Thông báo user offline cho tất cả client
      io.emit("updateUserStatus", {
        userId: disconnectedUserId,
        status: "offline",
      });
    }
  });
});

// 📌 Dùng server.listen thay vì app.listen
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
