// services/ordersService.js
const db = require("../db");

// KHÁCH HÀNG TẠO ĐƠN HÀNG
async function createOrder({ userId, full_name, phone, address, items }) {
  // Lấy thông tin sản phẩm theo danh sách product_id
  const productIds = items.map((i) => i.product_id);

  const [products] = await db.query(
    `SELECT id, name, price, stock
     FROM products
     WHERE id IN (${productIds.map(() => "?").join(",")})`,
    productIds
  );

  const productMap = {};
  products.forEach((p) => {
    productMap[p.id] = p;
  });

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const p = productMap[item.product_id];
    const quantity = Number(item.quantity || 0);

    if (!p) {
      const err = new Error(`Sản phẩm ID ${item.product_id} không tồn tại.`);
      err.statusCode = 400;
      throw err;
    }

    if (quantity <= 0) {
      const err = new Error(
        `Số lượng của sản phẩm ${p.name} không hợp lệ.`
      );
      err.statusCode = 400;
      throw err;
    }

    if (p.stock != null && quantity > p.stock) {
      const err = new Error(
        `Sản phẩm "${p.name}" chỉ còn ${p.stock} trong kho.`
      );
      err.statusCode = 400;
      throw err;
    }

    const unit_price = Number(p.price);
    totalAmount += unit_price * quantity;

    orderItems.push({ product_id: p.id, quantity, unit_price });
  }

  // Tạo đơn hàng
  const [orderResult] = await db.query(
    `INSERT INTO orders (user_id, full_name, phone, address, total_amount, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [userId, full_name, phone, address, totalAmount]
  );
  const orderId = orderResult.insertId;

  // Tạo order_items + trừ kho
  for (const item of orderItems) {
    await db.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
       VALUES (?, ?, ?, ?)`,
      [orderId, item.product_id, item.quantity, item.unit_price]
    );

    await db.query(
      `UPDATE products SET stock = stock - ? WHERE id = ?`,
      [item.quantity, item.product_id]
    );
  }

  // Lấy lại order vừa tạo
  const [[orderRow]] = await db.query(
    `SELECT id, user_id, full_name, phone, address, total_amount, status, created_at
     FROM orders
     WHERE id = ?`,
    [orderId]
  );

  return orderRow;
}

// KHÁCH HÀNG: danh sách đơn của mình
async function getCustomerOrders(userId) {
  const [rows] = await db.query(
    `SELECT id, full_name, phone, address, total_amount, status, created_at
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

// KHÁCH HÀNG: chi tiết 1 đơn của mình
async function getCustomerOrderDetail(userId, orderId) {
  const [[order]] = await db.query(
    `SELECT id, user_id, full_name, phone, address, total_amount, status, created_at
     FROM orders
     WHERE id = ? AND user_id = ?`,
    [orderId, userId]
  );

  if (!order) {
    return null;
  }

  const [items] = await db.query(
    `SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price,
            p.name AS product_name, p.thumbnail
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return { order, items };
}

// ADMIN: danh sách đơn
async function adminGetOrders() {
  const [rows] = await db.query(
    `SELECT o.id, o.full_name, o.phone, o.address,
            o.total_amount, o.status, o.created_at,
            u.email AS user_email
     FROM orders o
     JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC`
  );
  return rows;
}

// ADMIN: chi tiết 1 đơn
async function adminGetOrderDetail(orderId) {
  const [[order]] = await db.query(
    `SELECT o.id, o.full_name, o.phone, o.address,
            o.total_amount, o.status, o.created_at,
            u.email AS user_email
     FROM orders o
     JOIN users u ON o.user_id = u.id
     WHERE o.id = ?`,
    [orderId]
  );

  if (!order) {
    return null;
  }

  const [items] = await db.query(
    `SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price,
            p.name AS product_name, p.thumbnail
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return { order, items };
}

// ADMIN: cập nhật trạng thái
async function updateOrderStatus(orderId, status) {
  const [result] = await db.query(
    `UPDATE orders SET status = ? WHERE id = ?`,
    [status, orderId]
  );
  return result;
}

module.exports = {
  createOrder,
  getCustomerOrders,
  getCustomerOrderDetail,
  adminGetOrders,
  adminGetOrderDetail,
  updateOrderStatus,
};
