// routes/adminStats.js
const express = require("express");
const router = express.Router();

const { requireAdmin } = require("../middleware/auth");
const adminStatsController = require("../controllers/adminStatsController");

// TẤT CẢ URL Ở ĐÂY TÍNH TỪ PREFIX /api/admin/stats TRONG server.js

// GET /api/admin/stats/overview?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/overview", requireAdmin, adminStatsController.getOverview);

// GET /api/admin/stats/sales-by-date?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get(
  "/sales-by-date",
  requireAdmin,
  adminStatsController.getSalesByDate
);

// GET /api/admin/stats/top-products?limit=5&from=YYYY-MM-DD&to=YYYY-MM-DD
router.get(
  "/top-products",
  requireAdmin,
  adminStatsController.getTopProducts
);

// GET /api/admin/stats/top-categories?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get(
  "/top-categories",
  requireAdmin,
  adminStatsController.getTopCategories
);

// GET /api/admin/stats/low-stock?threshold=5
router.get(
  "/low-stock",
  requireAdmin,
  adminStatsController.getLowStockProducts
);

module.exports = router;
