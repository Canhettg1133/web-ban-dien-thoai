const express = require("express");
const multer = require("multer");
const path = require("path");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Lưu thẳng vào /uploads, giữ nguyên tên gốc => CỐ TÌNH không kiểm tra
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // giữ nguyên tên file
  },
});

const upload = multer({ storage });

// POST /api/upload-insecure
router.post("/upload-insecure", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Chưa chọn file." });

  // CHÚ Ý: Trả về đường dẫn "không lọc" để xem được html/js
  const publicUrl = `/public-unsafe/${req.file.filename}`;

  return res.json({
    message: "Upload (insecure) thành công.",
    url: publicUrl,
  });
});

module.exports = router;
