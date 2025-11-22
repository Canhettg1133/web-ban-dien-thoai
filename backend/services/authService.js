// services/authService.js
const db = require("../db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "very_secret_demo_key";

// Hàm tạo token dùng chung
function signUser(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      full_name: user.full_name,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" } // cho dev đỡ hết hạn
  );
}

// Đăng ký customer
async function register({ full_name, email, password, phone, address }) {
  // kiểm tra email tồn tại
  const [exist] = await db.query(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  if (exist.length > 0) {
    const err = new Error(
      "Email đã được sử dụng. Vui lòng dùng email khác."
    );
    err.statusCode = 400;
    throw err;
  }

  // DEMO: lưu plain text
  const [result] = await db.query(
    `
    INSERT INTO users (full_name, email, password_hash, phone, address, role)
    VALUES (?, ?, ?, ?, ?, 'customer')
  `,
    [full_name, email, password, phone || null, address || null]
  );

  const [rows] = await db.query(
    "SELECT id, full_name, email, role, phone, address FROM users WHERE id = ?",
    [result.insertId]
  );
  const user = rows[0];

  const token = signUser(user);

  return { user, token };
}

// Đăng nhập customer
async function loginCustomer({ email, password }) {
  const [rows] = await db.query(
    "SELECT id, full_name, email, role, password_hash, phone, address FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (!rows || rows.length === 0) {
    const err = new Error("Sai email hoặc mật khẩu.");
    err.statusCode = 401;
    throw err;
  }

  const user = rows[0];

  if (password !== user.password_hash) {
    const err = new Error("Sai email hoặc mật khẩu.");
    err.statusCode = 401;
    throw err;
  }

  if (user.role !== "customer") {
    const err = new Error(
      "Đây là tài khoản quản trị. Vui lòng đăng nhập ở trang ADMIN."
    );
    err.statusCode = 403;
    throw err;
  }

  const token = signUser(user);

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    },
  };
}

// Đăng nhập admin
async function loginAdmin({ email, password }) {
  const [rows] = await db.query(
    "SELECT id, full_name, email, role, password_hash FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (!rows || rows.length === 0) {
    const err = new Error("Sai email hoặc mật khẩu.");
    err.statusCode = 401;
    throw err;
  }

  const user = rows[0];

  if (password !== user.password_hash) {
    const err = new Error("Sai email hoặc mật khẩu.");
    err.statusCode = 401;
    throw err;
  }

  if (user.role !== "admin") {
    const err = new Error("Tài khoản này không có quyền admin.");
    err.statusCode = 403;
    throw err;
  }

  const token = signUser(user);

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
}

// Lấy user theo id (cho /me)
async function getUserById(userId) {
  const [rows] = await db.query(
    "SELECT id, full_name, email, role, phone, address FROM users WHERE id = ?",
    [userId]
  );
  return rows[0] || null;
}

module.exports = {
  signUser,
  register,
  loginCustomer,
  loginAdmin,
  getUserById,
};
