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
    const [notifications, setNotifications] = useState([]);

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

    // Cập nhật danh sách user online
    useEffect(() => {
        // Lắng nghe danh sách user online từ socket
        socket.on("update_online_users", (onlineUsers) => {
            console.log("👥 Cập nhật danh sách online:", onlineUsers);
            setUsers((prevUsers) =>
                prevUsers.map((u) => ({
                    ...u,
                    isOnline: onlineUsers.includes(u._id), // Đánh dấu user nào online
                }))
            );
        });

        return () => socket.off("update_online_users");
    }, [socket]);

    // Lắng nghe thông báo tin nhắn mới
    useEffect(() => {
        socket.on("new_notification", (data) => {
            console.log("Received notification:", data);
            setNotifications((prev) => [...prev, data]);
        });

        return () => socket.off("new_notification");
    }, [socket]);


    // 📌 Khi chuyển đổi giữa các user, cập nhật lại notifications
    useEffect(() => {
        if (selectedUser) {
            // Xóa sạch các thông báo khi người dùng chuyển qua cuộc trò chuyện khác
            setNotifications([]);
        }
    }, [selectedUser]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Chào người dùng */}
            {user && <h2 className="text-2xl font-bold text-center">Xin chào, {user.name} và bạn đang {user.status}!</h2>}

            {/* Icon thông báo */}
            <div className="relative flex justify-end">
                <button className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    🔔
                    {notifications.length > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 rounded-full">
                            {notifications.length}
                        </span>
                    )}
                </button>

                {/* Danh sách thông báo */}
                {notifications.length > 0 && (
                    <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-2">
                        {notifications.map((notif, index) => (
                            <div
                                key={index}
                                className="p-2 border-b cursor-pointer hover:bg-gray-200"
                                onClick={() => {
                                    navigate(`/chat/${notif.senderId}`);
                                    setNotifications((prev) => prev.filter((_, i) => i !== index));
                                }}
                            >
                                <p className="text-sm font-semibold">
                                    📩 Tin nhắn từ <span className="text-blue-600">{notif.senderName}</span>
                                </p>
                                <p className="text-xs text-gray-500">{notif.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Danh sách users hoặc chat */}
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
                <div className="mt-4">
                    <Chat
                        socket={socket} // ✅ Truyền socket
                        user={user} // ✅ User hiện tại
                        selectedUser={selectedUser} // ✅ User đang chat
                        onClose={() => setShowChat(false)} // ✅ Đóng chat
                        notifications={notifications} // Truyền notifications
                        setNotifications={setNotifications} // Truyền setNotifications
                    />
                </div>
            )}

            {/* Hiển thị nút đăng nhập/đăng xuất */}
            <div className="text-center">
                {!user ? (
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer"
                    >
                        Đăng nhập
                    </button>
                ) : (
                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg cursor-pointer"
                    >
                        Đăng xuất
                    </button>
                )}
            </div>
        </div>
    );

};

export default Home;
