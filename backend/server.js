// server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// ==== ROUTES ====
// business
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const usersRoutes = require("./routes/users");
const meRoutes = require("./routes/me");

// upload
const uploadInsecureRoutes = require("./routes/uploadInsecure"); // /api/upload-insecure
const uploadSecureRoutes = require("./routes/uploadSecure");     // /api/upload/image

// ⭐ THỐNG KÊ ADMIN
const adminStatsRoutes = require("./routes/adminStats"); // <--- THÊM DÒNG NÀY

const app = express();

// ==== CORS ====
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ==== Security headers ====
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ==== BODY PARSER ====
app.use(express.json({ limit: "2mb" }));

// ==== STATIC ====
// 1) Giữ TƯƠNG THÍCH với dữ liệu cũ: /uploads -> thư mục uploads
const ALLOWED_IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
app.use(
  "/uploads",
  (req, res, next) => {
    const ext = path.extname(req.path || "").toLowerCase();
    if (!ALLOWED_IMAGE_EXT.has(ext)) return res.status(404).end();
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// 2) Đường "không an toàn" để DEMO tấn công upload
app.use("/public-unsafe", express.static(path.join(__dirname, "uploads")));

// 3) Đường an toàn cho ảnh đã kiểm tra qua uploadSecure
app.use(
  "/uploads-images",
  express.static(path.join(__dirname, "uploads_images"), {
    dotfiles: "ignore",
    maxAge: "7d",
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=604800");
    },
  })
);

// ==== API ROUTES ====
// upload
app.use("/api", uploadInsecureRoutes);
app.use("/api", uploadSecureRoutes);

// ⭐ THỐNG KÊ ADMIN
// => các URL thực tế sẽ là:
//    GET /api/admin/stats/overview
//    GET /api/admin/stats/sales-by-date
//    GET /api/admin/stats/top-products
//    GET /api/admin/stats/top-categories
//    GET /api/admin/stats/low-stock
app.use("/api/admin/stats", adminStatsRoutes);

// business
app.use("/api/users", usersRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/me", meRoutes);

// ==== HEALTH ====
app.get("/", (req, res) => res.send("Mobile Store API đang chạy"));

// ==== 404 & ERROR ====
app.use((req, res) => res.status(404).json({ message: "Không tìm thấy." }));
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Lỗi server." });
});

// ==== START ====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ API chạy ở http://localhost:${PORT}`);
  console.log(`🧪 DEMO:        http://localhost:${PORT}/public-unsafe/<file>`);
  console.log(`🖼  Ảnh an toàn: http://localhost:${PORT}/uploads-images/<image>`);
});
