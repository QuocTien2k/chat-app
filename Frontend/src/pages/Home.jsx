import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { socket, listenOnlineUsers } from "../socket/socket";
import Chat from "../components/Chat";

const Home = () => {
    const { user, token, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(null);
    const [showChat, setShowChat] = useState(false);

    // 📌 Fetch danh sách users từ API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await axios.get("http://localhost:5000/api/auth/users");
                // Nếu đã đăng nhập, loại bỏ user đang đăng nhập khỏi danh sách
                setUsers(user ? data.filter(u => u._id !== user._id) : data);
            } catch (error) {
                console.error("Lỗi lấy danh sách users:", error);
            }
        };

        fetchUsers();

        // 📌 Lắng nghe danh sách online từ socket
        listenOnlineUsers((onlineUsers) => {
            setUsers(prevUsers =>
                prevUsers.map(u => ({
                    ...u,
                    isOnline: onlineUsers.includes(u._id), // ✅ Đánh dấu online đúng
                }))
            );
        });

    }, [user]); // Khi user thay đổi, gọi lại API

    // 📌 Khi click vào Card user
    const handleUserClick = (user) => {
        if (!token) {
            toast.warning("Bạn cần đăng nhập để nhắn tin!");
            return;
        }

        setSelectedUser(user);
        setShowChat(true);
    };

    return (
        <div className="container mx-auto p-6">
            {user && <h2 className="text-2xl font-bold">Xin chào, {user.name} và đang {user.status}!</h2>}
            <h2 className="text-2xl font-bold m-4">Danh Sách Users</h2>

            {/* 📌 Danh sách Users */}
            {!showChat ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {users.map((u) => (
                        <Card
                            key={u._id}
                            user={u}
                            onClick={() => handleUserClick(u)}
                            isOnline={u.isOnline}
                        />
                    ))}
                </div>
            ) : (
                <Chat
                    socket={socket} // ✅ Truyền socket
                    user={user} // ✅ User hiện tại
                    selectedUser={selectedUser} // ✅ User đang chat
                    onClose={() => setShowChat(false)} // ✅ Đóng chat
                />
            )}

            {/* 📌 Nếu chưa đăng nhập, hiển thị nút đăng nhập */}
            {!user ? (
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer"
                    >
                        Đăng nhập
                    </button>
                </div>
            ) : (
                <div className="text-center mt-6">
                    <button
                        onClick={logout}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer"
                    >
                        Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
