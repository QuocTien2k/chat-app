const Card = ({ user, onClick, isOnline }) => {
    return (
        <div
            key={user._id}
            className="relative p-4 border rounded shadow-md cursor-pointer hover:shadow-lg"
            onClick={() => onClick(user)}
        >
            {/* 🟢 Icon trạng thái Online */}
            {isOnline && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full"></span>
            )}
            <img
                src={user.avatar || "default-avatar.png"}
                alt="Avatar"
                className="w-16 h-16 rounded-full mx-auto"
            />
            <h3 className="text-xl font-semibold text-center">{user.name}</h3>
            <p className="text-center text-gray-600">{user.email}</p>
        </div>
    );
};

export default Card;