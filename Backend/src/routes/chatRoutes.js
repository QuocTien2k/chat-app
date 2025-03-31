const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/chatController");
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");

module.exports = (io) => {
  // 📌 Middleware kiểm tra ObjectId hợp lệ
  const validateObjectId = [
    check("senderId").isMongoId().withMessage("Sender ID không hợp lệ!"),
    check("receiverId").isMongoId().withMessage("Receiver ID không hợp lệ!"),
  ];

  // 📌 Middleware kiểm tra ID trong params
  const validateParamsId = (req, res, next) => {
    const { senderId, receiverId } = req.params;

    if (
      !mongoose.isValidObjectId(senderId) ||
      !mongoose.isValidObjectId(receiverId)
    ) {
      return res.status(400).json({ message: "ID không hợp lệ!" });
    }
    next();
  };

  // 📌 Route gửi tin nhắn (truyền io vào sendMessage)
  router.post("/send", validateObjectId, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    sendMessage(req, res, io);
  });

  // 📌 Route lấy tin nhắn giữa 2 user
  router.get("/:senderId/:receiverId", validateParamsId, getMessages);

  return router;
};
