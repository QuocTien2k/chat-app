import { useState } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ Import AuthContext
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth(); // ✅ Gọi hàm login từ AuthContext
    const navigate = useNavigate(); // ✅ Điều hướng

    const handleLogin = async (e) => {
        e.preventDefault();

        await login({ email, password });
        navigate("/"); // ✅ Chuyển hướng về trang chủ
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
}


export default Login;
