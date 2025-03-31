import { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const ChatBox = ({ user, currentUser, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const socket = useRef(null);

    // 📌 Kết nối socket 1 lần khi component mount
    useEffect(() => {
        if (!socket.current) {
            socket.current = io("http://localhost:5000", { transports: ["websocket"] });
            console.log("✅ Kết nối socket:", socket.current.id);

            socket.current.emit("joinRoom", currentUser._id);
        }

        return () => {
            if (socket.current) {
                console.log("❌ Ngắt kết nối socket");
                socket.current.disconnect();
                socket.current = null;
            }
        };
    }, []);


    // 📌 Tải tin nhắn khi chọn user
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

    // 📌 Nhận tin nhắn realtime
    useEffect(() => {
        if (!socket.current) return;

        const handleReceiveMessage = (message) => {
            if (message.chatId === `${currentUser._id}-${user._id}` || message.chatId === `${user._id}-${currentUser._id}`) {
                console.log("📩 Tin nhắn nhận được:", message);
                setMessages((prev) => [...prev, message]);
            }
        };

        socket.current.on("receiveMessage", handleReceiveMessage);

        return () => {
            if (socket.current) {
                socket.current.off("receiveMessage", handleReceiveMessage);
            }
        };
    }, [user._id, currentUser._id]);

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
            socket.current.emit("sendMessage", res.data);
            setNewMessage("");
        } catch (error) {
            console.error("❌ Lỗi gửi tin nhắn:", error);
        }
    };

    // 🔹 Xử lý sự kiện typing
    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (!typing) {
            setTyping(true);
            socket.current.emit("typing", { sender: currentUser._id, receiver: user._id });
        }
    };

    useEffect(() => {
        if (!socket.current) return;

        const handleReceiveMessage = (message) => {
            console.log("📩 Tin nhắn nhận được:", message);
            setMessages((prev) => [...prev, message]);
        };

        const handleTypingStatus = ({ sender }) => {
            if (sender === user._id) setTyping(true);
        };

        socket.current.on("receiveMessage", handleReceiveMessage);
        socket.current.on("typing", handleTypingStatus);

        return () => {
            if (socket.current) {
                socket.current.off("receiveMessage", handleReceiveMessage);
                socket.current.off("typing", handleTypingStatus);
            }
        };
    }, []);



    // 🔹 Cuộn xuống cuối khi có tin nhắn mới
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
                    {typing && <span className="text-sm">(Đang nhập...)</span>}
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
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 flex gap-2 border-t">
                <input
                    type="text"
                    className="flex-1 border rounded-full px-3 py-2 outline-none"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={handleTyping}
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
