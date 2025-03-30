import { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import ChatBox from "../components/ChatBox";

const socket = io("http://localhost:5000"); // 🔥 Kết nối đến server WebSocket
const Home = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user"));
    //console.log(user);
    const [onlineUsers, setOnlineUsers] = useState({}); // Lưu trạng thái online
    const [chatUsers, setChatUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem("token"); // ✅ Lấy token trực tiếp khi cần
            try {
                const { data } = await axios.get("http://localhost:5000/api/auth/users", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                const loggedInUser = JSON.parse(localStorage.getItem("user"));
                const filteredUsers = loggedInUser ? data.filter(u => u._id !== loggedInUser._id) : data;
                setUsers(filteredUsers);
            } catch (error) {
                console.error("❌ Lỗi khi lấy danh sách user:", error);
            }
        };

        fetchUsers();

        // 🟢 Khi user vào trang, gửi ID đến server để đánh dấu online
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        if (loggedInUser) {
            socket.emit("join", loggedInUser._id);
        }

        // 📌 Lắng nghe sự kiện update trạng thái từ server
        socket.on("updateUserStatus", ({ userId, status }) => {
            setOnlineUsers((prev) => ({ ...prev, [userId]: status }));
        });

        return () => {
            socket.off("updateUserStatus");
        };
    }, []); // chạy 1 lần khi component mount


    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log(token);

            if (!token) {
                console.log("⚠️ Không tìm thấy token, có thể đã đăng xuất.");
                return;
            }

            await axios.post("http://localhost:5000/api/auth/logout", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Xóa token & user khỏi localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate(0);
        } catch (error) {
            toast.error("Lỗi khi đăng xuất! ", error);
        }
    };

    // Hàm mở chat
    const max_chatboxs = 3; // Giới hạn số lượng chatbox mở cùng lúc
    const handleOpenChat = (otherUser) => {
        const currentUser = JSON.parse(localStorage.getItem("user")); // Lấy user đang đăng nhập

        //console.log("🟢 Người mở chat (currentUser):", currentUser);
        //console.log("🔵 Người được chọn (otherUser):", otherUser);

        if (!otherUser || !otherUser._id) {
            //console.error("❌ Không có thông tin người chat:", otherUser);
            return;
        }

        if (otherUser._id === currentUser._id) {
            console.warn("⚠️ Không thể chat với chính mình!");
            return;
        }

        setChatUsers((prev) => {
            if (prev.some((u) => u._id === otherUser._id)) {
                //console.log("✅ Đã có trong danh sách chat.");
                return prev;
            }

            if (prev.length >= max_chatboxs) {
                //console.log("🔄 Giới hạn chatbox, xóa chatbox đầu tiên.");
                return [...prev.slice(1), otherUser];
            }

            //console.log("➕ Thêm user mới vào danh sách chat.");
            return [...prev, otherUser];
        });
    };

    // Hàm đóng chat
    const handleCloseChat = (userId) => {
        setChatUsers((prev) => prev.filter((user) => user._id !== userId));
    };

    return (
        <div className="p-5">
            {currentUser && <h1 className="text-2xl font-bold text-center mb-5">Xin chào, {currentUser?.name}</h1>}
            <div className="my-3">
                {currentUser ? (
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer">
                        Đăng Xuất
                    </button>
                ) : (
                    <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
                        Đăng Nhập
                    </Link>
                )}
            </div>
            <h1 className="text-2xl font-bold text-center mb-5">Danh sách User</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {users.map((otherUser) => (
                    <Card
                        key={otherUser._id}
                        user={otherUser} // Đây là user khác, không phải currentUser
                        isOnline={onlineUsers[otherUser._id] === "online"}
                        onSelect={() => handleOpenChat(otherUser)}
                    />
                ))}
            </div>

            {/* Hiển thị các cửa sổ chat đang mở */}
            <div className="fixed bottom-4 right-4 flex gap-4">
                {chatUsers.map((chatUser) => (
                    <ChatBox key={chatUser._id} user={chatUser} currentUser={currentUser} onClose={handleCloseChat} />

                ))}
            </div>

        </div>
    );
};

export default Home;
