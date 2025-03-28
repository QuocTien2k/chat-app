import { useState } from "react";

const ChatBox = ({ user, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const sendMessage = () => {
        if (newMessage.trim()) {
            setMessages([...messages, { text: newMessage, sender: "me" }]);
            setNewMessage("");
        }
    };

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
                    <div key={index} className={`p-2 max-w-[75%] rounded-xl ${msg.sender === "me" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}>
                        {msg.text}
                    </div>
                ))}
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
