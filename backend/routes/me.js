// routes/me.js
const express = require("express");
const router = express.Router();
const { requireCustomer } = require("../middleware/auth");
const meController = require("../controllers/meController");

// Lấy thông tin tài khoản hiện tại
router.get("/", requireCustomer, meController.getProfile);

// Cập nhật thông tin cơ bản (full_name, email, phone, address)
router.put("/", requireCustomer, meController.updateProfile);

// Đổi mật khẩu
router.put(
  "/password",
  requireCustomer,
  meController.changePassword
);

module.exports = router;
