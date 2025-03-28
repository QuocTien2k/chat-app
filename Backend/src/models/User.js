const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      default:
        "https://img.icons8.com/?size=100&id=tZuAOUGm9AuS&format=png&color=000000",
    }, // Ảnh đại diện
    status: { type: String, enum: ["online", "offline"], default: "offline" }, // Thêm status
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
