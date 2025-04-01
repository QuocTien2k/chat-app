import { useEffect, useState } from "react";
import axios from "axios";
import ScrollToBottom from "react-scroll-to-bottom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Chat = ({ socket, selectedUser, onClose, setNotifications }) => {
    const { user, token } = useAuth();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);


    useEffect(() => {
        // Lọc thông báo đã được mở chat
        setNotifications((prev) => prev.filter((notif) => notif.senderId !== selectedUser._id));
    }, [selectedUser, setNotifications]);

    // 📌 Lấy danh sách tin nhắn từ API khi mở hộp chat
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await axios.get(
                    `http://localhost:5000/api/chat/${user._id}/${selectedUser._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessages(data);
            } catch (error) {
                console.error("Lỗi lấy tin nhắn:", error);
            }
        };

        fetchMessages();
    }, [user, selectedUser, token]);

    // 📌 Nhận tin nhắn realtime
    useEffect(() => {
        const receiveMessage = (data) => {
            if (data.senderId === selectedUser._id || data.receiverId === selectedUser._id) {
                setMessages((prev) => [...prev, data]);
            }
        };

        socket.on("receive_message", receiveMessage);
        return () => socket.off("receive_message", receiveMessage);
    }, [socket, selectedUser]);

    // 📌 Gửi tin nhắn qua API & socket
    const sendMessage = async () => {
        if (!message.trim()) return;

        const messageData = {
            senderId: user._id,
            receiverId: selectedUser._id,
            content: message,
        };

        try {
            const { data } = await axios.post(
                "http://localhost:5000/api/chat/send",
                messageData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            socket.emit("send_message", data);
            setMessages((prev) => [...prev, data]);
            setMessage("");
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
            toast.error("Gửi tin nhắn thất bại!");
        }
    };

    return (
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-red-500">❌</button>
            </div>

            {/* Chat Body */}
            <ScrollToBottom className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg, index) => {
                    const isSender = (msg.senderId._id || msg.senderId) === user._id;
                    return (
                        <div key={index} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                            <div className={`my-2 p-2 max-w-xs rounded-lg ${isSender ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                                <p>{msg.content}</p>
                                <span className="text-xs opacity-60">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    );
                })}
            </ScrollToBottom>

            {/* Chat Input */}
            <div className="p-3 border-t flex items-center">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 border p-2 rounded-lg"
                />
                <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg">📨</button>
            </div>
        </div>
    );
};

export default Chat;
