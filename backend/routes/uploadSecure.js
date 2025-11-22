const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "..", "uploads_images");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Đặt tên ngẫu nhiên, lưu tạm với đuôi của tên gốc (sẽ sửa lại theo MIME thật)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const base = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, base + ext);
  },
});

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error("Chỉ cho phép ảnh JPG/PNG/WEBP."), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// Helper: dynamic import file-type (ESM)
async function detectFileType(filePath) {
  const { fileTypeFromFile } = await import("file-type");
  return fileTypeFromFile(filePath);
}

// POST /api/upload/image
router.post("/upload/image", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Chưa chọn file." });

    const filePath = req.file.path;
    const type = await detectFileType(filePath); // kiểm tra magic bytes

    if (!type || !ALLOWED_MIME.includes(type.mime)) {
      fs.unlinkSync(filePath); // XÓA nếu không phải ảnh thật
      return res.status(400).json({ message: "File không phải ảnh hợp lệ." });
    }

    // Ép đuôi đúng với loại ảnh thật
    const realExt = type.ext === "jpeg" ? ".jpg" : `.${type.ext}`;
    const newName = path.basename(filePath, path.extname(filePath)) + realExt;
    const newPath = path.join(UPLOAD_DIR, newName);
    if (newPath !== filePath) fs.renameSync(filePath, newPath);

    const publicUrl = `/uploads-images/${newName}`;
    return res.json({ message: "Upload ảnh thành công.", url: publicUrl });
  } catch (err) {
    console.error("Lỗi upload ảnh:", err);
    return res.status(500).json({ message: "Lỗi server khi upload ảnh." });
  }
});

// Bắt lỗi từ multer (dung lượng, sai mime...)
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File quá lớn (tối đa 2MB)." });
    }
    return res.status(400).json({ message: `Lỗi upload: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ message: err.message || "Upload thất bại." });
  }
  next();
});

module.exports = router;
