const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  // Tạo token, hết hạn trong 30 ngày
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
