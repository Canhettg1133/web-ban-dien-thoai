// services/meService.js
const db = require("../db");

// Lấy thông tin user theo id
async function getUserProfile(userId) {
  const [[user]] = await db.query(
    `SELECT id, full_name, email, role, phone, address
     FROM users
     WHERE id = ?`,
    [userId]
  );
  return user || null;
}

// Cập nhật thông tin cơ bản
async function updateUserProfile(userId, { full_name, email, phone, address }) {
  // check trùng email người khác
  const [[dup]] = await db.query(
    `SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1`,
    [email, userId]
  );
  if (dup) {
    const err = new Error("Email đã được dùng bởi tài khoản khác.");
    err.statusCode = 409;
    throw err;
  }

  const fields = ["full_name = ?", "email = ?"];
  const params = [full_name.trim(), email.trim()];

  // Chỉ set nếu có cột & có truyền lên
  if (typeof phone === "string") {
    fields.push("phone = ?");
    params.push(phone.trim());
  }
  if (typeof address === "string") {
    fields.push("address = ?");
    params.push(address.trim());
  }

  params.push(userId);

  await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);

  // trả về user sau khi cập nhật
  return await getUserProfile(userId);
}

// Đổi mật khẩu (demo: so plain-text như code gốc)
async function changePassword(userId, current_password, new_password) {
  const [[u]] = await db.query(
    `SELECT password_hash FROM users WHERE id = ?`,
    [userId]
  );

  if (!u) {
    const err = new Error("Không tìm thấy tài khoản.");
    err.statusCode = 404;
    throw err;
  }

  // DEMO: đang dùng plain text giống code login hiện tại
  if (u.password_hash !== current_password) {
    const err = new Error("Mật khẩu hiện tại không đúng.");
    err.statusCode = 401;
    throw err;
  }

  await db.query(
    `UPDATE users SET password_hash = ? WHERE id = ?`,
    [new_password, userId]
  );

  return true;
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
};
