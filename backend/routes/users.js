// routes/users.js
const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/auth");
const usersController = require("../controllers/usersController");

// Lấy danh sách users (lọc theo role, tìm kiếm q=)
router.get("/", requireAdmin, usersController.listUsers);

// Tạo user mới (admin tạo)
router.post("/", requireAdmin, usersController.createUser);

// Cập nhật thông tin/role user (không đổi password ở đây)
router.patch("/:id", requireAdmin, usersController.updateUser);

// Đặt lại mật khẩu
router.put(
  "/:id/password",
  requireAdmin,
  usersController.resetPassword
);

// Xóa user
router.delete("/:id", requireAdmin, usersController.deleteUser);

module.exports = router;
