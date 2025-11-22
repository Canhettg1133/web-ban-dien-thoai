// routes/orders.js
const express = require("express");
const router = express.Router();
const { requireCustomer, requireAdmin } = require("../middleware/auth");
const ordersController = require("../controllers/ordersController");

// KHÁCH HÀNG TẠO ĐƠN HÀNG
// POST /api/orders
router.post("/", requireCustomer, ordersController.createOrder);

// KHÁCH HÀNG XEM ĐƠN CỦA MÌNH
// GET /api/orders/my
router.get("/my", requireCustomer, ordersController.getMyOrders);

// KHÁCH HÀNG XEM CHI TIẾT 1 ĐƠN CỦA MÌNH
// (Đặt trước /:id để không xung đột)
router.get("/my/:id", requireCustomer, ordersController.getMyOrderDetail);

// ADMIN: LẤY DANH SÁCH ĐƠN
// GET /api/orders
router.get("/", requireAdmin, ordersController.adminGetOrders);

// ADMIN: XEM CHI TIẾT 1 ĐƠN
// GET /api/orders/:id
router.get("/:id", requireAdmin, ordersController.adminGetOrderDetail);

// ADMIN: CẬP NHẬT TRẠNG THÁI
// PATCH /api/orders/:id/status
router.patch(
  "/:id/status",
  requireAdmin,
  ordersController.updateOrderStatus
);

module.exports = router;
