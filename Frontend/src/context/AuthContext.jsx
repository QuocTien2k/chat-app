import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { emitUserOnline } from "../socket/socket";

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || "");

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            fetchUser();
        }
    }, [token]);

    // 📌 Lấy thông tin user từ token
    const fetchUser = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/auth/user");
            setUser(res.data);
        } catch (error) {
            console.error("Lỗi lấy user:", error);
            setUser(null);
        }
    };

    // 📌 Đăng ký user
    const register = async (userData) => {
        try {
            const res = await axios.post("http://localhost:5000/api/auth/register", userData);
            const { token, user } = res.data; // Lấy token và user từ response

            setUser(user);
            setToken(token);
            localStorage.setItem("token", token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            toast.success("Đăng ký thành công!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Đăng ký thất bại!");
        }
    };

    // 📌 Đăng nhập user
    const login = async (userData) => {
        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", userData);
            setUser(res.data);
            setToken(res.data.token);
            localStorage.setItem("token", res.data.token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

            emitUserOnline(res.data._id); // 🟢 Gửi userId lên server khi đăng nhập
            //toast.success("Đăng nhập thành công!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Đăng nhập thất bại!");
            throw error; // Ném lỗi để component có thể xử lý tiếp (nếu cần)
        }
    };

    // 📌 Đăng xuất user
    const logout = async () => {
        try {
            await axios.post("http://localhost:5000/api/auth/logout");
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        }

        setUser(null);
        setToken("");
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];

        toast.success("Đăng xuất thành công!");
    };

    return (
        <AuthContext.Provider value={{ user, token, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
