// controllers/adminStatsController.js
const adminStatsService = require("../services/adminStatsService");

// GET /api/admin/stats/overview
async function getOverview(req, res) {
  try {
    const { from, to } = req.query;
    const data = await adminStatsService.getOverview(from, to);
    return res.json(data);
  } catch (err) {
    console.error("Lỗi stats overview:", err);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy thống kê tổng quan." });
  }
}

// GET /api/admin/stats/sales-by-date
async function getSalesByDate(req, res) {
  try {
    const { from, to } = req.query;
    const data = await adminStatsService.getSalesByDate(from, to);
    return res.json(data);
  } catch (err) {
    console.error("Lỗi stats sales-by-date:", err);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy biểu đồ doanh thu." });
  }
}

// GET /api/admin/stats/top-products
async function getTopProducts(req, res) {
  try {
    const { limit, from, to } = req.query;
    const data = await adminStatsService.getTopProducts(limit, from, to);
    return res.json(data);
  } catch (err) {
    console.error("Lỗi stats top-products:", err);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy top sản phẩm." });
  }
}

// GET /api/admin/stats/top-categories
async function getTopCategories(req, res) {
  try {
    const { from, to } = req.query;
    const data = await adminStatsService.getTopCategories(from, to);
    return res.json(data);
  } catch (err) {
    console.error("Lỗi stats top-categories:", err);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy top danh mục." });
  }
}

// GET /api/admin/stats/low-stock
async function getLowStockProducts(req, res) {
  try {
    const { threshold } = req.query;
    const data = await adminStatsService.getLowStockProducts(threshold);
    return res.json(data);
  } catch (err) {
    console.error("Lỗi stats low-stock:", err);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy sản phẩm sắp hết hàng." });
  }
}

module.exports = {
  getOverview,
  getSalesByDate,
  getTopProducts,
  getTopCategories,
  getLowStockProducts,
};
