// controllers/categoriesController.js
const categoriesService = require("../services/categoriesService");

// GET /api/categories  -> public
async function getCategories(req, res) {
  console.log("=== GỌI /api/categories ===");

  try {
    const rows = await categoriesService.getAllCategories();
    console.log("=== CATEGORIES LẤY ĐƯỢC:", rows.length);
    return res.json(rows);
  } catch (err) {
    console.error("Lỗi MySQL categories:", err);
    return res.status(500).json({
      message: "Lỗi server.",
      error: err.code || err.message,
    });
  }
}

// POST /api/categories  -> tạo danh mục mới (admin)
async function createCategory(req, res) {
  const { name, slug, description, parent_id } = req.body;

  if (!name || !slug) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập TÊN và SLUG danh mục." });
  }

  try {
    const category = await categoriesService.createCategory({
      name,
      slug,
      description,
      parent_id,
    });

    return res.status(201).json(category);
  } catch (err) {
    console.error("Lỗi tạo danh mục:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Slug danh mục đã tồn tại. Hãy chọn slug khác.",
      });
    }

    return res.status(500).json({ message: "Lỗi server." });
  }
}

// PUT /api/categories/:id  -> cập nhật danh mục (admin)
async function updateCategory(req, res) {
  const id = req.params.id;
  const { name, slug, description, parent_id } = req.body;

  if (!name || !slug) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập TÊN và SLUG danh mục." });
  }

  try {
    const category = await categoriesService.updateCategory(id, {
      name,
      slug,
      description,
      parent_id,
    });

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục." });
    }

    return res.json(category);
  } catch (err) {
    console.error("Lỗi cập nhật danh mục:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Slug danh mục đã tồn tại. Hãy chọn slug khác.",
      });
    }

    return res.status(500).json({ message: "Lỗi server." });
  }
}

// DELETE /api/categories/:id  -> xoá danh mục (admin)
async function deleteCategory(req, res) {
  const id = req.params.id;

  try {
    const result = await categoriesService.deleteCategory(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy danh mục." });
    }

    return res.json({ message: "Đã xoá danh mục." });
  } catch (err) {
    console.error("Lỗi xoá danh mục:", err);

    if (err.statusCode) {
      // lỗi nghiệp vụ (còn sản phẩm thuộc danh mục)
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Lỗi server." });
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
