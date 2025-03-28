const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
} = require("../controllers/authController");
const { protect, protectOptional } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser); // ✅ Bảo vệ API logout
router.get("/users", protectOptional, getAllUsers);
module.exports = router;
