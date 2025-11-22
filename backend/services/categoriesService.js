// services/categoriesService.js
const db = require("../db");

// Lấy tất cả categories (public)
async function getAllCategories() {
  const sql = `
    SELECT id, name, slug, description, parent_id
    FROM categories
    ORDER BY id ASC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

// Tạo category mới
async function createCategory({ name, slug, description, parent_id }) {
  const [result] = await db.query(
    `
      INSERT INTO categories (name, slug, description, parent_id)
      VALUES (?, ?, ?, ?)
    `,
    [name, slug, description || null, parent_id || null]
  );

  const newId = result.insertId;

  const [rows] = await db.query(
    "SELECT id, name, slug, description, parent_id FROM categories WHERE id = ?",
    [newId]
  );

  return rows[0];
}

// Cập nhật category
async function updateCategory(id, { name, slug, description, parent_id }) {
  const [result] = await db.query(
    `
      UPDATE categories
      SET name = ?, slug = ?, description = ?, parent_id = ?
      WHERE id = ?
    `,
    [name, slug, description || null, parent_id || null, id]
  );

  if (result.affectedRows === 0) {
    return null; // không tìm thấy
  }

  const [rows] = await db.query(
    "SELECT id, name, slug, description, parent_id FROM categories WHERE id = ?",
    [id]
  );

  return rows[0];
}

// Xoá category
async function deleteCategory(id) {
  // kiểm tra còn sản phẩm thuộc danh mục không
  const [check] = await db.query(
    "SELECT COUNT(*) AS cnt FROM products WHERE category_id = ?",
    [id]
  );

  if (check[0].cnt > 0) {
    const err = new Error(
      "Không thể xoá vì vẫn còn sản phẩm thuộc danh mục này."
    );
    err.statusCode = 400;
    throw err;
  }

  const [result] = await db.query("DELETE FROM categories WHERE id = ?", [id]);
  return result;
}

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
