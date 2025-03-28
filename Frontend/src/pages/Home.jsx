import { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // 🔥 Kết nối đến server WebSocket
const Home = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    //console.log(user);
    const [onlineUsers, setOnlineUsers] = useState({}); // Lưu trạng thái online

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

    return (
        <div className="p-5">
            {user && <h1 className="text-2xl font-bold text-center mb-5">Xin chào, {user?.name}</h1>}
            <div className="my-3">
                {user ? (
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
                {users.map((user) => (
                    <Card key={user._id} user={user} isOnline={onlineUsers[user._id] === "online"} />
                ))}
            </div>
        </div>
    );
};

export default Home;
