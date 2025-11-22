// routes/categories.js
const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/auth");
const categoriesController = require("../controllers/categoriesController");

// GET /api/categories  -> public, trang chủ dùng
router.get("/", categoriesController.getCategories);

// POST /api/categories  -> tạo danh mục mới (admin)
router.post("/", requireAdmin, categoriesController.createCategory);

// PUT /api/categories/:id  -> cập nhật danh mục (admin)
router.put("/:id", requireAdmin, categoriesController.updateCategory);

// DELETE /api/categories/:id  -> xoá danh mục (admin)
router.delete("/:id", requireAdmin, categoriesController.deleteCategory);

module.exports = router;
