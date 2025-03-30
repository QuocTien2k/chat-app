const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/chatController");
const { check, validationResult } = require("express-validator");

// 📌 Middleware kiểm tra ObjectId hợp lệ
const validateObjectId = [
  check("sender").isMongoId().withMessage("Sender ID không hợp lệ!"),
  check("receiver").isMongoId().withMessage("Receiver ID không hợp lệ!"),
];

// 📌 Route gửi tin nhắn
router.post("/send", sendMessage);

// 📌 Route lấy tin nhắn giữa 2 user
router.get(
  "/:sender/:receiver",
  validateObjectId,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  getMessages
);

module.exports = router;
