import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // 🔗 URL của server Socket.io

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true, // ✅ Cho phép gửi credentials
  transports: ["websocket"], // ✅ Chỉ dùng websocket, tránh lỗi polling
});

// 📌 Hàm khởi động socket
export const connectSocket = (userId) => {
  if (!userId) return;
  socket.auth = { userId }; // 🔹 Gửi userId để server biết ai kết nối
  socket.connect(); // 🔹 Kết nối đến server

  socket.on("connect", () => {
    console.log("🔌 Connected to Socket.io server, ID:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from Socket.io server");
  });

  // 📌 Lắng nghe danh sách user online
  socket.on("online-users", (users) => {
    console.log("👥 Online Users:", users);
  });
};

export const emitUserOnline = (userId) => {
  if (userId) {
    console.log("User đang online: ", userId);
    socket.emit("user-online", userId);
  }
};

export const listenOnlineUsers = (callback) => {
  socket.on("online-users", callback);
};
