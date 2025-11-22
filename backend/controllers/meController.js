// controllers/meController.js
const meService = require("../services/meService");

// GET /api/me  - lấy thông tin tài khoản hiện tại
async function getProfile(req, res) {
  const userId = req.user.id;

  try {
    const user = await meService.getUserProfile(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tài khoản." });
    }

    return res.json(user);
  } catch (err) {
    console.error("GET /api/me:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
}

// PUT /api/me  - cập nhật full_name, email, phone, address
async function updateProfile(req, res) {
  const userId = req.user.id;
  const { full_name, email, phone, address } = req.body || {};

  if (!full_name || !email) {
    return res
      .status(400)
      .json({ message: "Thiếu full_name hoặc email." });
  }

  try {
    const user = await meService.updateUserProfile(userId, {
      full_name,
      email,
      phone,
      address,
    });

    return res.json(user);
  } catch (err) {
    console.error("PUT /api/me:", err);

    if (err.statusCode) {
      // lỗi nghiệp vụ từ service (trùng email, v.v.)
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Lỗi server." });
  }
}

// PUT /api/me/password  - đổi mật khẩu
async function changePassword(req, res) {
  const userId = req.user.id;
  const { current_password, new_password } = req.body || {};

  if (!current_password || !new_password) {
    return res
      .status(400)
      .json({ message: "Thiếu current_password hoặc new_password." });
  }

  try {
    await meService.changePassword(
      userId,
      current_password,
      new_password
    );

    return res.json({ message: "Đổi mật khẩu thành công." });
  } catch (err) {
    console.error("PUT /api/me/password:", err);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Lỗi server." });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
