import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const ChatBox = ({ user, currentUser, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null); // 🔹 Tạo ref
    const socket = useRef(null); // Dùng useRef để lưu socket

    //console.log("ChatBox Props:", { currentUser, user });

    // 📌 Kết nối socket 1 lần duy nhất khi component mount
    useEffect(() => {
        if (!socket.current) {
            socket.current = io("http://localhost:5000", {
                transports: ["websocket"],
            });

            socket.current.emit("joinRoom", { userId: currentUser._id });

            console.log("✅ Kết nối socket:", socket.current.connected);
        }

        return () => {
            socket.current.disconnect();
            socket.current = null;
        };
    }, [currentUser._id]);

    // 📌 Tải tin nhắn từ database khi chọn user chat
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/chat/${currentUser._id}/${user._id}`
                );
                setMessages(res.data);
            } catch (error) {
                console.error("❌ Lỗi tải tin nhắn:", error);
            }
        };

        fetchMessages();
    }, [user._id, currentUser._id]);

    // 📌 Nhận tin nhắn realtime từ socket
    useEffect(() => {
        if (!socket.current) return;

        const handleReceiveMessage = (message) => {
            console.log("📩 Tin nhắn nhận được:", message);
            setMessages((prev) => [...prev, message]);
        };

        socket.current.on("receiveMessage", handleReceiveMessage);

        return () => {
            if (socket.current) {
                socket.current.off("receiveMessage", handleReceiveMessage);
            }
        };
    }, []);

    // 📩 Gửi tin nhắn
    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            sender: currentUser._id,
            receiver: user._id,
            content: newMessage,
        };

        try {
            const res = await axios.post("http://localhost:5000/api/chat/send", messageData, {
                headers: { Authorization: `Bearer ${currentUser.token}` },
            });

            setMessages((prev) => [...prev, res.data]);

            setNewMessage("");
        } catch (error) {
            console.error("❌ Lỗi gửi tin nhắn:", error);
        }
    };

    // 🔹 Hàm tự động cuộn xuống cuối khi tin nhắn thay đổi
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="w-80 bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                    <span className="font-bold">{user.name}</span>
                </div>
                <span className="cursor-pointer text-xl" onClick={() => onClose(user._id)}>❌</span>
            </div>

            {/* Body Chat */}
            <div className="p-3 h-64 overflow-y-auto flex flex-col gap-2">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`p-2 max-w-[75%] rounded-xl ${msg.sender === currentUser._id
                            ? "bg-blue-500 text-white self-end"
                            : "bg-gray-200 text-black self-start"
                            }`}
                    >
                        {msg.content}
                    </div>
                ))}
                {/* 🔹 Phần tử ẩn dùng để cuộn */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 flex gap-2 border-t">
                <input
                    type="text"
                    className="flex-1 border rounded-full px-3 py-2 outline-none"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded-full" onClick={sendMessage}>
                    Gửi
                </button>
            </div>
        </div>
    );
};

export default ChatBox;
