// controllers/authController.js
const authService = require("../services/authService");

// POST /api/auth/register
async function register(req, res) {
  const { full_name, email, password, phone, address } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({
      message: "Vui lòng nhập HỌ TÊN, EMAIL và MẬT KHẨU.",
    });
  }

  try {
    const { user, token } = await authService.register({
      full_name,
      email,
      password,
      phone,
      address,
    });

    return res.status(201).json({
      message: "Đăng ký thành công.",
      token,
      user,
    });
  } catch (err) {
    console.error("❌ LỖI REGISTER:", err);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Lỗi server." });
  }
}

// POST /api/auth/login  (customer)
async function login(req, res) {
  const { email, password } = req.body;
  console.log("=== LOGIN CUSTOMER ===", req.body);

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập email và mật khẩu." });
  }

  try {
    const result = await authService.loginCustomer({ email, password });

    return res.json({
      message: "Đăng nhập thành công.",
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    console.error("❌ LỖI LOGIN CUSTOMER:", err);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Lỗi server." });
  }
}

// POST /api/auth/admin-login
async function adminLogin(req, res) {
  const { email, password } = req.body;
  console.log("=== LOGIN ADMIN ===", req.body);

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập email và mật khẩu." });
  }

  try {
    const result = await authService.loginAdmin({ email, password });

    return res.json({
      message: "Đăng nhập admin thành công.",
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    console.error("❌ LỖI LOGIN ADMIN:", err);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Lỗi server." });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  try {
    const user = await authService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    return res.json(user);
  } catch (err) {
    console.error("❌ LỖI /me:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
}

module.exports = {
  register,
  login,
  adminLogin,
  getMe,
};
