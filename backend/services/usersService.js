// services/usersService.js
const db = require("../db");

// Lấy danh sách users (lọc theo role, q)
async function listUsers({ q = "", role = "" } = {}) {
  let sql = `SELECT id, full_name, email, role FROM users WHERE 1=1`;
  const params = [];

  if (role) {
    sql += ` AND role = ?`;
    params.push(role);
  }
  if (q) {
    sql += ` AND (email LIKE ? OR full_name LIKE ?)`;
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += ` ORDER BY id DESC`;

  const [rows] = await db.query(sql, params);
  return rows;
}

// Tạo user mới
async function createUser({ full_name, email, role, password }) {
  // Check trùng email
  const [rows] = await db.query(
    `SELECT id FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  const exists = rows[0];
  if (exists) {
    const err = new Error("Email đã tồn tại.");
    err.statusCode = 409;
    throw err;
  }

  const [result] = await db.query(
    `INSERT INTO users (full_name, email, role, password_hash) VALUES (?, ?, ?, ?)`,
    [full_name, email, role, password]
  );

  const [rows2] = await db.query(
    `SELECT id, full_name, email, role FROM users WHERE id = ?`,
    [result.insertId]
  );
  return rows2[0];
}

// Cập nhật thông tin / role user
async function updateUser({ id, full_name, email, role, currentUserId }) {
  // Lấy user hiện tại
  const [rows] = await db.query(
    `SELECT id, full_name, email, role FROM users WHERE id = ?`,
    [id]
  );
  const target = rows[0];

  if (!target) {
    const err = new Error("Không tìm thấy user.");
    err.statusCode = 404;
    throw err;
  }

  // Nếu hạ admin -> role khác, không để mất admin cuối cùng
  if (target.role === "admin" && typeof role === "string" && role !== "admin") {
    const [rows2] = await db.query(
      `SELECT COUNT(*) AS c FROM users WHERE role = 'admin' AND id <> ?`,
      [id]
    );
    const cnt = rows2[0].c;
    if (cnt === 0) {
      const err = new Error("Không thể hạ quyền admin cuối cùng.");
      err.statusCode = 400;
      throw err;
    }
  }

  // Nếu sửa email: kiểm tra format + trùng
  let newEmail = undefined;
  if (typeof email === "string") {
    newEmail = email.trim();
    const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!re.test(newEmail)) {
      const err = new Error("Email không hợp lệ.");
      err.statusCode = 400;
      throw err;
    }

    const [rows3] = await db.query(
      `SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1`,
      [newEmail, id]
    );
    const dupe = rows3[0];
    if (dupe) {
      const err = new Error("Email đã tồn tại.");
      err.statusCode = 409;
      throw err;
    }
  }

  // Xây SET động
  const fields = [];
  const params = [];

  if (typeof full_name === "string") {
    fields.push("full_name = ?");
    params.push(full_name.trim());
  }
  if (typeof email === "string") {
    fields.push("email = ?");
    params.push(newEmail);
  }
  if (typeof role === "string") {
    fields.push("role = ?");
    params.push(role);
  }

  if (!fields.length) {
    const err = new Error("Không có dữ liệu để cập nhật.");
    err.statusCode = 400;
    throw err;
  }

  params.push(id);

  const [result] = await db.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    params
  );

  if (result.affectedRows === 0) {
    const err = new Error("Không tìm thấy user.");
    err.statusCode = 404;
    throw err;
  }

  const [rows4] = await db.query(
    `SELECT id, full_name, email, role FROM users WHERE id = ?`,
    [id]
  );
  const user = rows4[0];

  const need_relogin =
    currentUserId &&
    currentUserId === id &&
    (
      (typeof email === "string" && newEmail !== target.email) ||
      (typeof role === "string" && role !== target.role)
    );

  return { user, need_relogin };
}

// Đặt lại mật khẩu
async function resetPassword(id, new_password) {
  const [result] = await db.query(
    `UPDATE users SET password_hash = ? WHERE id = ?`,
    [new_password, id]
  );

  if (result.affectedRows === 0) {
    const err = new Error("Không tìm thấy user.");
    err.statusCode = 404;
    throw err;
  }

  return true;
}

// Xóa user
async function deleteUser({ id, currentUserId }) {
  // Không cho tự xóa chính mình
  if (currentUserId === id) {
    const err = new Error(
      "Không thể tự xóa tài khoản đang đăng nhập."
    );
    err.statusCode = 400;
    throw err;
  }

  // Không xóa admin cuối cùng
  const [rows] = await db.query(
    `SELECT role FROM users WHERE id = ?`,
    [id]
  );
  const u = rows[0];

  if (!u) {
    const err = new Error("Không tìm thấy user.");
    err.statusCode = 404;
    throw err;
  }

  if (u.role === "admin") {
    const [rows2] = await db.query(
      `SELECT COUNT(*) AS c FROM users WHERE role = 'admin' AND id <> ?`,
      [id]
    );
    const cnt = rows2[0].c;
    if (cnt.c === 0 || cnt === 0) { // phòng trường hợp rows2[0].c hoặc cnt
      const err = new Error("Không thể xóa admin cuối cùng.");
      err.statusCode = 400;
      throw err;
    }
  }

  const [result] = await db.query(
    `DELETE FROM users WHERE id = ?`,
    [id]
  );

  if (result.affectedRows === 0) {
    const err = new Error("Không tìm thấy user.");
    err.statusCode = 404;
    throw err;
  }

  return true;
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
};
