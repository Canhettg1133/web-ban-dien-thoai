// middleware/auth.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "very_secret_demo_key";

// Middleware chung: đọc token & decode, gán vào req.user
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Thiếu token xác thực." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("=== TOKEN DECODED ===", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Lỗi verify token:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn." });
    }

    return res.status(401).json({ message: "Token không hợp lệ." });
  }
}

// Chỉ cho phép admin
function requireAdmin(req, res, next) {
  authMiddleware(req, res, () => {
    console.log("=== REQUIRE ADMIN, req.user =", req.user);
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Chỉ tài khoản admin mới được phép." });
    }
    next();
  });
}

// Chỉ cho phép khách hàng (customer)
function requireCustomer(req, res, next) {
  authMiddleware(req, res, () => {
    console.log("=== REQUIRE CUSTOMER, req.user =", req.user);
    if (!req.user || req.user.role !== "customer") {
      return res
        .status(403)
        .json({ message: "Chỉ khách hàng đã đăng nhập mới được đặt hàng." });
    }
    next();
  });
}

module.exports = {
  authMiddleware,
  requireAdmin,
  requireCustomer,
};
