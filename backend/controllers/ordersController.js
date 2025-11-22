// controllers/ordersController.js
const ordersService = require("../services/ordersService");

// Danh sách trạng thái hợp lệ
const ORDER_STATUSES = [
  "pending",
  "paid",
  "shipping",
  "completed",
  "cancelled",
];

// KHÁCH HÀNG TẠO ĐƠN HÀNG  - POST /api/orders
async function createOrder(req, res) {
  const userId = req.user.id;
  const { full_name, phone, address, items } = req.body;

  if (!full_name || !phone || !address) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập họ tên, số điện thoại và địa chỉ." });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "Giỏ hàng trống, không thể tạo đơn." });
  }

  try {
    const order = await ordersService.createOrder({
      userId,
      full_name,
      phone,
      address,
      items,
    });

    return res
      .status(201)
      .json({ message: "Đặt hàng thành công.", order });
  } catch (err) {
    console.error("Lỗi tạo đơn hàng:", err);

    // Lỗi validate từ service (statusCode = 400)
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res
      .status(500)
      .json({ message: "Lỗi server khi tạo đơn hàng." });
  }
}

// KHÁCH HÀNG XEM DANH SÁCH ĐƠN CỦA MÌNH - GET /api/orders/my
async function getMyOrders(req, res) {
  const userId = req.user.id;
  try {
    const rows = await ordersService.getCustomerOrders(userId);
    return res.json(rows);
  } catch (err) {
    console.error("Lỗi lấy đơn của khách:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
}

// KHÁCH HÀNG XEM CHI TIẾT 1 ĐƠN CỦA MÌNH - GET /api/orders/my/:id
async function getMyOrderDetail(req, res) {
  const userId = req.user.id;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID không hợp lệ." });
  }

  try {
    const data = await ordersService.getCustomerOrderDetail(userId, id);

    if (!data) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng của bạn." });
    }

    return res.json(data);
  } catch (err) {
    console.error("Lỗi lấy chi tiết đơn (my):", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
}

// ADMIN: LẤY DANH SÁCH ĐƠN - GET /api/orders
async function adminGetOrders(req, res) {
  try {
    const rows = await ordersService.adminGetOrders();
    return res.json(rows);
  } catch (err) {
    console.error("Lỗi admin lấy danh sách đơn:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
}

// ADMIN: XEM CHI TIẾT 1 ĐƠN - GET /api/orders/:id
async function adminGetOrderDetail(req, res) {
  const id = req.params.id;

  try {
    const data = await ordersService.adminGetOrderDetail(id);

    if (!data) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng." });
    }

    return res.json(data);
  } catch (err) {
    console.error("Lỗi admin xem chi tiết đơn:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
}

// ADMIN: CẬP NHẬT TRẠNG THÁI - PATCH /api/orders/:id/status
async function updateOrderStatus(req, res) {
  const id = req.params.id;
  const { status } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ." });
  }

  try {
    const result = await ordersService.updateOrderStatus(id, status);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    return res.json({ message: "Đã cập nhật trạng thái đơn hàng." });
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái đơn:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderDetail,
  adminGetOrders,
  adminGetOrderDetail,
  updateOrderStatus,
};
