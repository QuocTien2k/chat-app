const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/chatController");

// 📌 Route gửi tin nhắn
router.post("/send", sendMessage);

// 📌 Route lấy tin nhắn giữa 2 user
router.get("/:sender/:receiver", getMessages);

module.exports = router;
