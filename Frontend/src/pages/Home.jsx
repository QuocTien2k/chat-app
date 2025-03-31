import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const { user, token, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

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
    }, [user]); // Khi user thay đổi, gọi lại API

    // 📌 Khi click vào Card user
    const handleUserClick = (selectedUser) => {
        if (!token) {
            toast.warning("Bạn cần đăng nhập để nhắn tin!");
            return;
        }

        // 🟢 Nếu đã đăng nhập, điều hướng đến trang chat (ví dụ)
        navigate(`/chat/${selectedUser._id}`);
    };

    return (
        <div className="container mx-auto p-6">
            {user && <h2 className="text-2xl font-bold">Xin chào, {user.name} và đang {user.status}!</h2>}
            <h2 className="text-2xl font-bold m-4">Danh Sách Users</h2>

            {/* 📌 Danh sách Users */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {users.map((u) => (
                    <div key={u._id} className="p-4 border rounded shadow-md cursor-pointer hover:shadow-lg"
                        onClick={() => handleUserClick(u)}>
                        <img src={u.avatar || "default-avatar.png"} alt="Avatar" className="w-16 h-16 rounded-full mx-auto" />
                        <h3 className="text-xl font-semibold text-center">{u.name}</h3>
                        <p className="text-center text-gray-600">{u.email}</p>
                    </div>
                ))}
            </div>

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
