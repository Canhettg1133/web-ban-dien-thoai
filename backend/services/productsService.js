// services/productsService.js
const db = require("../db");

// Lấy danh sách sản phẩm (có thể lọc theo categorySlug)
async function getProducts(categorySlug) {
  let sql = `
    SELECT p.*
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
  `;
  const params = [];

  if (categorySlug) {
    sql += " AND c.slug = ?";
    params.push(categorySlug);
  }

  const [rows] = await db.query(sql, params);
  return rows;
}

// Lấy chi tiết 1 sản phẩm theo id
async function getProductById(id) {
  const sql = "SELECT * FROM products WHERE id = ? AND is_active = 1";
  const [rows] = await db.query(sql, [id]);
  return rows[0] || null;
}

// 🔍 Tìm kiếm sản phẩm theo từ khoá (name / description)
async function searchProducts(keyword) {
  const like = `%${keyword}%`;

  const sql = `
    SELECT p.*
    FROM products p
    WHERE p.is_active = 1
      AND (p.name LIKE ? OR p.description LIKE ?)
    ORDER BY p.id DESC
  `;

  const [rows] = await db.query(sql, [like, like]);
  return rows;
}

// Tạo sản phẩm mới
async function createProduct(data) {
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
  } = data;

  // Mặc định active = 1, trừ khi truyền is_active = 0
  const isActive = is_active === 0 ? 0 : 1;

  const sql = `
    INSERT INTO products
      (category_id, name, slug, description, price, old_price, stock, thumbnail, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    category_id,
    name,
    slug,
    description || null,
    price,
    old_price || null,
    stock ?? 0,
    thumbnail || null,
    isActive,
  ];

  const [result] = await db.query(sql, params);
  const newId = result.insertId;

  const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [
    newId,
  ]);
  return rows[0];
}

// Cập nhật sản phẩm
async function updateProduct(id, data) {
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
  } = data;

  const isActive = is_active ? 1 : 0;

  const sql = `
    UPDATE products
    SET
      category_id = ?,
      name        = ?,
      slug        = ?,
      description = ?,
      price       = ?,
      old_price   = ?,
      stock       = ?,
      thumbnail   = ?,
      is_active   = ?
    WHERE id = ?
  `;

  const params = [
    category_id,
    name,
    slug,
    description || null,
    price,
    old_price || null,
    stock ?? 0,
    thumbnail || null,
    isActive,
    id,
  ];

  const [result] = await db.query(sql, params);
  return result;
}

// Xóa mềm (ẩn sản phẩm)
async function softDeleteProduct(id) {
  const sql = "UPDATE products SET is_active = 0 WHERE id = ?";
  const [result] = await db.query(sql, [id]);
  return result;
}

module.exports = {
  getProducts,
  getProductById,
  searchProducts,   // 👈 NHỚ EXPORT
  createProduct,
  updateProduct,
  softDeleteProduct,
};
