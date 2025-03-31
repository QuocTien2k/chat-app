require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
//const Message = require("./models/Message");

const app = express();
connectDB(); // Kết nối MongoDB

app.use(express.json()); // Middleware parse JSON
app.use(cors());
const PORT = process.env.PORT || 5000;

// 📌 Khởi tạo server HTTP
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", // 🔥 Chỉ cho phép frontend truy cập
    methods: ["GET", "POST"],
  },
});

// 📌 Khởi tạo socket.io trước khi truyền vào routes
const chatRoutes = require("./routes/chatRoutes")(io);

// 📌 Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

//socket kết nối
io.on("connection", (socket) => {
  //console.log("🟢 User connected:", socket.id);

  socket.on("join_room", (data) => {
    socket.join(data); // Tham gia room theo ID
    //console.log("✅ User joined room:", data);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    //console.log("❌ User disconnected:", socket.id);
  });
});

/*
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", // 🔥 Chỉ cho phép frontend truy cập
    methods: ["GET", "POST"],
  },
});

// 📌 Lưu io vào app để dùng trong controller
app.set("socketio", io);

// 📌 Quản lý user online
let onlineUsers = new Map();
app.set("onlineUsers", onlineUsers);
io.on("connection", (socket) => {
  //console.log("🟢 User connected:", socket.id);

  // 📌 User vào app sẽ gửi ID để server lưu lại
  socket.on("join", (userId) => {
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set()); // 🔥 Dùng Set để lưu nhiều socketId
    }
    onlineUsers.get(userId).add(socket.id);

    console.log("✅ User online:", userId, " | Tất cả socket:", [
      ...onlineUsers.get(userId),
    ]);

    io.emit("updateUserStatus", { userId, status: "online" });
  });

  // 📌 Nhận tin nhắn từ client và gửi ngay đến receiver
  socket.on("sendMessage", async (message) => {
    const { sender, receiver, content } = message;

    try {
      // 📌 Lưu vào database trước khi gửi qua socket
      const newMessage = new Message({
        sender,
        receiver,
        content,
        seen: false, // Mặc định chưa đọc
      });

      await newMessage.save(); // Lưu vào MongoDB

      const receiverSocketId = onlineUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", message);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lưu tin nhắn:", err);
    }
  });

  // 📌 Khi user rời đi
  socket.on("disconnect", () => {
    let disconnectedUserId = null;

    onlineUsers.forEach((sockets, userId) => {
      if (sockets.has(socket.id)) {
        disconnectedUserId = userId;
        sockets.delete(socket.id);
      }

      if (sockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit("updateUserStatus", { userId, status: "offline" });
      }
    });

    console.log("❌ User disconnected:", disconnectedUserId, "| Còn lại:", [
      ...onlineUsers.keys(),
    ]);
  });
});
*/

// 📌 Dùng server.listen thay vì app.listen
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
