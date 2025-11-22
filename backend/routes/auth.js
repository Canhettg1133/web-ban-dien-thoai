// routes/auth.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const authController = require("../controllers/authController");

// KHÁCH HÀNG ĐĂNG KÝ
// POST /api/auth/register
router.post("/register", authController.register);

// KHÁCH HÀNG ĐĂNG NHẬP (web)
/// POST /api/auth/login
router.post("/login", authController.login);

// ADMIN ĐĂNG NHẬP
// POST /api/auth/admin-login
router.post("/admin-login", authController.adminLogin);

// LẤY THÔNG TIN USER TỪ TOKEN
// GET /api/auth/me
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
