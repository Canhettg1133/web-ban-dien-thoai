// controllers/usersController.js
const usersService = require("../services/usersService");

// GET /api/users
async function listUsers(req, res) {
  try {
    const { q = "", role = "" } = req.query;
    const rows = await usersService.listUsers({ q, role });
    return res.json(rows);
  } catch (err) {
    console.error("Lỗi GET /api/users:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
}

// POST /api/users
async function createUser(req, res) {
  try {
    const { full_name, email, role, password } = req.body || {};
    if (!full_name || !email || !role || !password) {
      return res
        .status(400)
        .json({
          message: "Thiếu full_name, email, role, password.",
        });
    }

    const user = await usersService.createUser({
      full_name,
      email,
      role,
      password,
    });

    return res.status(201).json(user);
  } catch (err) {
    console.error("Lỗi POST /api/users:", err);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Lỗi server." });
  }
}

// PATCH /api/users/:id
async function updateUser(req, res) {
  try {
    const id = Number(req.params.id);
    const { full_name, email, role } = req.body || {};

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    const result = await usersService.updateUser({
      id,
      full_name,
      email,
      role,
      currentUserId: req.user?.id,
    });

    return res.json({
      user: result.user,
      need_relogin: result.need_relogin,
    });
  } catch (err) {
    console.error("Lỗi PATCH /api/users/:id:", err);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Lỗi server." });
  }
}

// PUT /api/users/:id/password
async function resetPassword(req, res) {
  try {
    const id = Number(req.params.id);
    const { new_password } = req.body || {};

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    if (!new_password) {
      return res.status(400).json({ message: "Thiếu new_password." });
    }

    await usersService.resetPassword(id, new_password);

    return res.json({ message: "Đặt lại mật khẩu thành công." });
  } catch (err) {
    console.error("Lỗi PUT /api/users/:id/password:", err);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Lỗi server." });
  }
}

// DELETE /api/users/:id
async function deleteUser(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    await usersService.deleteUser({
      id,
      currentUserId: req.user?.id,
    });

    return res.json({ message: "Đã xóa user." });
  } catch (err) {
    console.error("Lỗi DELETE /api/users/:id:", err);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Lỗi server." });
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
};
