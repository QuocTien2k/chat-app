import { toast } from "react-toastify";
const Card = ({ user, isOnline }) => {
    const handleClick = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            toast.warning("Vui lòng đăng nhập để chat!");
        } else {
            console.log(`Mở chat với ${user.name} - Tạm thời chưa làm bước này`);
        }
    };
    return (
        <div onClick={handleClick} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center cursor-pointer">
            <div className="relative">
                <span
                    className={`absolute top-1 right-0 w-4 h-4 border-2 border-white rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                ></span>
                <img
                    src={user.avatar || "https://via.placeholder.com/100"}
                    alt={user.name}
                    className="w-20 h-20 rounded-full mb-3"
                />
            </div>
            <h2 className="text-lg font-bold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>

        </div>
    );
};

export default Card;
