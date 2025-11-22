  // routes/products.js
  const express = require("express");
  const router = express.Router();
  const { authMiddleware, requireAdmin } = require("../middleware/auth");
  const productsController = require("../controllers/productsController");

  // ========== FRONTEND ==========
  // /api/products?category=slug
  router.get("/", productsController.listProducts);

  // 🔍 /api/products/search?q=keyword
  router.get("/search", productsController.searchProducts);

  // /api/products/:id
  router.get("/:id", productsController.getProduct);

  // ========== ADMIN ==========
  router.post(
    "/",
    authMiddleware,
    requireAdmin,
    productsController.createProduct
  );

  router.put(
    "/:id",
    authMiddleware,
    requireAdmin,
    productsController.updateProduct
  );

  router.delete(
    "/:id",
    authMiddleware,
    requireAdmin,
    productsController.deleteProduct
  );

  module.exports = router;
