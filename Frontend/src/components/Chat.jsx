import { useEffect, useState } from "react";

const Chat = ({ socket, user, selectedUser, onClose }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data]);
        });
    }, [socket]);

    const sendMessage = () => {
        if (message.trim() === "") return;
        const messageData = {
            senderId: user._id,
            receiverId: selectedUser._id,
            content: message,
            time: new Date().toLocaleTimeString(),
        };
        socket.emit("send_message", messageData);
        setMessages((prev) => [...prev, messageData]);
        setMessage("");
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                <p>Chat với {selectedUser.name}</p>
                <button onClick={onClose}>❌</button>
            </div>
            <div className="chat-body">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === user._id ? "you" : "other"}>
                        <p>{msg.message}</p>
                        <span>{msg.time}</span>
                    </div>
                ))}
            </div>
            <div className="chat-footer">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage}>📨</button>
            </div>
        </div>
    );
}
export default Chat;
