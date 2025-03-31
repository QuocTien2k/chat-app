import { useState } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ Import AuthContext
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { register } = useAuth(); // ✅ Gọi hàm register từ AuthContext
    const navigate = useNavigate(); // ✅ Điều hướng

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate("/login"); // ✅ Chuyển hướng về trang đăng nhập
        } catch (error) {
            toast.error(error.response?.data?.message || "Đăng ký thất bại! Vui lòng thử lại.");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form className="p-6 bg-white shadow-md rounded-lg" onSubmit={handleRegister}>
                <h2 className="text-2xl font-bold mb-4">Đăng Ký</h2>
                <input
                    type="text"
                    placeholder="Họ và Tên"
                    className="border p-2 w-full mb-3"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
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
                    Đăng Ký
                </button>
                <div className="my-3">
                    <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
                </div>
            </form>
        </div>
    );
};

export default Register;
