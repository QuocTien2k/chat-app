import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            });
            //console.log("📌 Dữ liệu nhận từ API:", data);

            localStorage.setItem("token", data.token); // ✅ Lưu token vào localStorage
            localStorage.setItem("user", JSON.stringify({ // ✅ Lưu user vào localStorage
                _id: data._id,
                name: data.name,
                email: data.email,
                avatar: data.avatar,
                status: data.status,
            }));

            window.location.href = "/"; // ✅ Chuyển về trang Home
        } catch (error) {
            //console.error("Đăng nhập thất bại! ", error);
            toast.error(error.response?.data?.message);

        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form className="p-6 bg-white shadow-md rounded-lg" onSubmit={handleLogin}>
                <h2 className="text-2xl font-bold mb-4">Đăng Nhập</h2>
                <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 w-full mb-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    className="border p-2 w-full mb-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded cursor-pointer">
                    Đăng Nhập
                </button>
                <div className="my-3">
                    <p>Chưa có tài khoản? <Link to="/register" >Đăng ký</Link></p>
                </div>
            </form>
        </div>
    );
};

export default Login;
