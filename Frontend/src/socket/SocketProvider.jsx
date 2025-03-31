import { createContext, useContext, useEffect } from "react";
import { socket, connectSocket } from "./socket";
import { useAuth } from "../context/AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth(); // 🔹 Lấy user từ AuthContext

    useEffect(() => {
        if (user?._id) {
            connectSocket(user._id); // 🔹 Kết nối socket khi có user
        } else {
            socket.disconnect(); // 🔹 Ngắt kết nối khi đăng xuất
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
