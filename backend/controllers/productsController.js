const productsService = require("../services/productsService");

// GET /api/products?category=slug
async function listProducts(req, res) {
  const categorySlug = req.query.category;
  console.log("=== GET /api/products, category =", categorySlug);

  try {
    const rows = await productsService.getProducts(categorySlug);
    return res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách sản phẩm:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
}

// 🔍 GET /api/products/search?q=keyword
async function searchProducts(req, res) {
  const q = req.query.q || "";
  console.log("=== GET /api/products/search, q =", q);

  const keyword = q.trim();
  if (!keyword) {
    // Không có từ khoá -> trả về mảng rỗng
    return res.json([]);
  }

  try {
    const rows = await productsService.searchProducts(keyword);
    return res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi search sản phẩm:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
}

// GET /api/products/:id
async function getProduct(req, res) {
  const id = req.params.id;
  console.log("=== GET /api/products/", id);

  try {
    const product = await productsService.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    return res.json(product);
  } catch (err) {
    console.error("❌ Lỗi lấy chi tiết sản phẩm:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
}

// POST /api/products
async function createProduct(req, res) {
  try {
    const {
      category_id,
      name,
      slug,
      description,
      price,
      old_price,
      stock,
      thumbnail,
      is_active,
    } = req.body;

    if (!category_id || !name || !slug || !price) {
      return res
        .status(400)
        .json({ message: "Thiếu category_id, name, slug hoặc price." });
    }

    const product = await productsService.createProduct({
      category_id,
      name,
      slug,
      description,
      price,
      old_price,
      stock,
      thumbnail,
      is_active,
    });

    return res.status(201).json({
      message: "Tạo sản phẩm thành công.",
      product,
    });
  } catch (err) {
    console.error("❌ Lỗi tạo sản phẩm:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "Slug đã tồn tại, vui lòng chọn slug khác." });
    }

    return res
      .status(500)
      .json({ message: "Lỗi server khi tạo sản phẩm." });
  }
}

// PUT /api/products/:id
async function updateProduct(req, res) {
  const { id } = req.params;

  try {
    const {
      category_id,
      name,
      slug,
      description,
      price,
      old_price,
      stock,
      thumbnail,
      is_active,
    } = req.body;

    if (!category_id || !name || !slug || !price) {
      return res
        .status(400)
        .json({ message: "Thiếu category_id, name, slug hoặc price." });
    }

    const result = await productsService.updateProduct(id, {
      category_id,
      name,
      slug,
      description,
      price,
      old_price,
      stock,
      thumbnail,
      is_active,
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    const product = await productsService.getProductById(id);

    return res.json({
      message: "Cập nhật sản phẩm thành công.",
      product,
    });
  } catch (err) {
    console.error("❌ Lỗi cập nhật sản phẩm:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "Slug đã tồn tại, vui lòng chọn slug khác." });
    }

    return res
      .status(500)
      .json({ message: "Lỗi server khi cập nhật sản phẩm." });
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const result = await productsService.softDeleteProduct(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    return res.json({ message: "Đã ẩn sản phẩm (is_active = 0)." });
  } catch (err) {
    console.error("❌ Lỗi xóa/ẩn sản phẩm:", err);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xóa sản phẩm." });
  }
}

module.exports = {
  listProducts,
  searchProducts,   // 👈 export thêm
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
