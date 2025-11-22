// services/adminStatsService.js
const db = require("../db");

// Helper: chuẩn hoá khoảng ngày (mặc định 30 ngày gần nhất)
function normalizeDateRange(from, to) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const today = new Date();

  let toDate = to ? new Date(to) : today;
  if (Number.isNaN(toDate.getTime())) toDate = today;

  let fromDate;
  if (from) {
    fromDate = new Date(from);
    if (Number.isNaN(fromDate.getTime())) {
      fromDate = new Date(toDate.getTime() - 29 * MS_PER_DAY);
    }
  } else {
    fromDate = new Date(toDate.getTime() - 29 * MS_PER_DAY);
  }

  if (fromDate > toDate) {
    const tmp = fromDate;
    fromDate = toDate;
    toDate = tmp;
  }

  const fmt = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD
  return {
    fromDate: fmt(fromDate),
    toDate: fmt(toDate),
  };
}

// ⚠️ NẾU cột doanh thu trong bảng orders của bạn là total_price
// thì đổi "total_amount" bên dưới thành "total_price"
const REVENUE_COLUMN = "total_amount";

// 1) Tổng quan hệ thống
async function getOverview(from, to) {
  const { fromDate, toDate } = normalizeDateRange(from, to);

  // 1.1 User theo role
  const [userRows] = await db.query(
    `
    SELECT
      SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) AS totalCustomers,
      SUM(CASE WHEN role = 'admin'    THEN 1 ELSE 0 END) AS totalAdmins
    FROM users
  `
  );
  const userStats = userRows[0] || {
    totalCustomers: 0,
    totalAdmins: 0,
  };

  // 1.2 Tổng sản phẩm đang bán
  const [prodRows] = await db.query(
    `SELECT COUNT(*) AS totalActiveProducts
     FROM products
     WHERE is_active = 1`
  );
  const prodStats = prodRows[0] || { totalActiveProducts: 0 };

  // 1.3 Tổng đơn + doanh thu (all time)
  const [allOrderRows] = await db.query(
    `
    SELECT
      COUNT(*) AS totalOrdersAllTime,
      COALESCE(SUM(${REVENUE_COLUMN}), 0) AS totalRevenueAllTime
    FROM orders
    WHERE status IN ('PAID', 'COMPLETED')
  `
  );
  const allOrderStats = allOrderRows[0] || {
    totalOrdersAllTime: 0,
    totalRevenueAllTime: 0,
  };

  // 1.4 Đơn + doanh thu theo khoảng ngày
  const [rangeOrderRows] = await db.query(
    `
    SELECT
      COUNT(*) AS totalOrdersInRange,
      COALESCE(SUM(${REVENUE_COLUMN}), 0) AS totalRevenueInRange
    FROM orders
    WHERE status IN ('PAID', 'COMPLETED')
      AND DATE(created_at) BETWEEN ? AND ?
  `,
    [fromDate, toDate]
  );
  const rangeOrderStats = rangeOrderRows[0] || {
    totalOrdersInRange: 0,
    totalRevenueInRange: 0,
  };

  // 1.5 Hôm nay
  const [todayRows] = await db.query(
    `
    SELECT
      COUNT(*) AS todayOrders,
      COALESCE(SUM(${REVENUE_COLUMN}), 0) AS todayRevenue
    FROM orders
    WHERE status IN ('PAID', 'COMPLETED')
      AND DATE(created_at) = CURDATE()
  `
  );
  const todayStats = todayRows[0] || {
    todayOrders: 0,
    todayRevenue: 0,
  };

  // 1.6 Khách hàng mới trong khoảng ngày
  const [newCusRows] = await db.query(
    `
    SELECT COUNT(*) AS newCustomersInRange
    FROM users
    WHERE role = 'customer'
      AND DATE(created_at) BETWEEN ? AND ?
  `,
    [fromDate, toDate]
  );
  const newCusStats = newCusRows[0] || { newCustomersInRange: 0 };

  return {
    dateRange: { from: fromDate, to: toDate },
    users: userStats,
    products: prodStats,
    ordersAllTime: allOrderStats,
    ordersInRange: rangeOrderStats,
    today: todayStats,
    customersInRange: newCusStats,
  };
}

// 2) Doanh thu theo ngày
async function getSalesByDate(from, to) {
  const { fromDate, toDate } = normalizeDateRange(from, to);

  const [rows] = await db.query(
    `
    SELECT
      DATE(created_at) AS date,
      COUNT(*) AS orderCount,
      COALESCE(SUM(${REVENUE_COLUMN}), 0) AS revenue
    FROM orders
    WHERE status IN ('PAID', 'COMPLETED')
      AND DATE(created_at) BETWEEN ? AND ?
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at)
  `,
    [fromDate, toDate]
  );

  return {
    dateRange: { from: fromDate, to: toDate },
    list: rows,
  };
}

// 3) Top sản phẩm
async function getTopProducts(limit = 5, from, to) {
  const { fromDate, toDate } = normalizeDateRange(from, to);

  const [rows] = await db.query(
    `
    SELECT
      p.id          AS product_id,
      p.name        AS product_name,
      SUM(oi.quantity) AS quantity,
      COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
    FROM order_items oi
    JOIN orders o   ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.status IN ('PAID', 'COMPLETED')
      AND DATE(o.created_at) BETWEEN ? AND ?
    GROUP BY p.id, p.name
    ORDER BY quantity DESC
    LIMIT ?
  `,
    [fromDate, toDate, Number(limit) || 5]
  );

  return {
    dateRange: { from: fromDate, to: toDate },
    list: rows,
  };
}

// 4) Doanh thu theo danh mục
async function getTopCategories(from, to) {
  const { fromDate, toDate } = normalizeDateRange(from, to);

  const [rows] = await db.query(
    `
    SELECT
      c.id   AS category_id,
      c.name AS category_name,
      COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue,
      COALESCE(SUM(oi.quantity), 0) AS quantity
    FROM order_items oi
    JOIN orders o    ON oi.order_id = o.id
    JOIN products p  ON oi.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE o.status IN ('PAID', 'COMPLETED')
      AND DATE(o.created_at) BETWEEN ? AND ?
    GROUP BY c.id, c.name
    ORDER BY revenue DESC
  `,
    [fromDate, toDate]
  );

  return {
    dateRange: { from: fromDate, to: toDate },
    list: rows,
  };
}

// 5) Sản phẩm sắp hết hàng
async function getLowStockProducts(threshold = 5) {
  const [rows] = await db.query(
    `
    SELECT
      p.id,
      p.name,
      p.stock,
      p.is_active,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.stock IS NOT NULL
      AND p.stock <= ?
    ORDER BY p.stock ASC, p.id ASC
  `,
    [Number(threshold) || 5]
  );

  return rows;
}

module.exports = {
  getOverview,
  getSalesByDate,
  getTopProducts,
  getTopCategories,
  getLowStockProducts,
};
