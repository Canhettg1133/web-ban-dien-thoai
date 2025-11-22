// src/pages/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "customer", label: "Khách hàng" },
];

export default function AdminUsers() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  const me = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminInfo")) || null;
    } catch {
      return null;
    }
  })();

  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal TẠO user
  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    role: "customer",
    password: "",
  });

  // modal SỬA user
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editErr, setEditErr] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, q]);

  async function loadUsers() {
    try {
      setLoading(true);
      setErr("");
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (q.trim()) params.set("q", q.trim());

      const res = await fetch(`${API_BASE}/api/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.message || "Không tải được users.");
      setUsers(data);
    } catch (e) {
      console.error("Lỗi tải users:", e);
      setErr(e.message || "Lỗi tải users.");
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(user, newRole) {
    if (user.role === newRole) return;
    if (!window.confirm(`Đổi quyền của ${user.email} -> ${newRole}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Đổi quyền thất bại.");
      await loadUsers();
    } catch (e) {
      alert(e.message || "Đổi quyền thất bại.");
    }
  }

  async function resetPassword(user) {
    const pw = prompt(`Nhập mật khẩu mới cho ${user.email}:`);
    if (!pw) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_password: pw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Đặt lại mật khẩu thất bại.");
      alert("Đặt lại mật khẩu thành công.");
    } catch (e) {
      alert(e.message || "Đặt lại mật khẩu thất bại.");
    }
  }

  async function deleteUser(user) {
    if (!window.confirm(`Xóa tài khoản ${user.email}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Xóa tài khoản thất bại.");
      await loadUsers();
    } catch (e) {
      alert(e.message || "Xóa tài khoản thất bại.");
    }
  }

  async function createUser(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Tạo tài khoản thất bại.");
      setCreateOpen(false);
      setNewUser({ full_name: "", email: "", role: "customer", password: "" });
      await loadUsers();
    } catch (e) {
      alert(e.message || "Tạo tài khoản thất bại.");
    }
  }

  // ==== SỬA: mở modal ====
  function openEdit(u) {
    setEditErr("");
    setEditUser({ ...u }); // {id, full_name, email, role}
    setEditOpen(true);
  }

  // ==== SỬA: lưu ====
  async function saveEdit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setEditErr("");
      const res = await fetch(`${API_BASE}/api/users/${editUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: editUser.full_name,
          email: editUser.email,
          // Cho phép chỉnh role ngay tại modal (tuỳ bạn dùng hay không):
          role: editUser.role,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại.");

      // nếu backend báo cần đăng nhập lại và đây là chính mình
      if (data.need_relogin && me && me.id === editUser.id) {
        alert("Thông tin tài khoản đã thay đổi, vui lòng đăng nhập lại.");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        navigate("/admin/login");
        return;
      }

      setEditOpen(false);
      await loadUsers();
    } catch (e) {
      setEditErr(e.message || "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  }

  const Sidebar = () => (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <div className="admin-logo-main">MOBILE ADMIN</div>
        <div className="admin-logo-sub">Quản lý cửa hàng</div>
      </div>
      <div className="admin-menu">
        <button className="admin-menu-item" onClick={() => navigate("/admin/san-pham")}>
          <i className="fas fa-box" />
          <span>Sản phẩm</span>
        </button>
        <button className="admin-menu-item" onClick={() => navigate("/admin/danh-muc")}>
          <i className="fas fa-layer-group" />
          <span>Danh mục</span>
        </button>
        <button className="admin-menu-item" onClick={() => navigate("/admin/don-hang")}>
          <i className="fas fa-file-invoice" />
          <span>Đơn hàng</span>
        </button>
        <button
          className="admin-menu-item admin-menu-item-active"
          onClick={() => navigate("/admin/tai-khoan")}
        >
          <i className="fas fa-users" />
          <span>Tài khoản</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="admin-main">
        <header className="admin-main-header">
          <div>
            <h1>Quản lý tài khoản</h1>
            <p>Xem, tạo mới, sửa họ tên/email, đổi quyền, đặt lại mật khẩu, xoá tài khoản.</p>
          </div>
          <button className="admin-btn-primary" onClick={() => setCreateOpen(true)}>
            + Tạo tài khoản
          </button>
        </header>

        {/* filter */}
        <div className="admin-filter-bar">
          <div className="admin-filter-group">
            <label>Quyền</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="admin">Admin</option>
              <option value="customer">Khách hàng</option>
            </select>
          </div>
          <div className="admin-filter-group">
            <label>Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên / email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="admin-filter-info">
            Đang hiển thị <strong>{users.length}</strong> tài khoản
          </div>
        </div>

        {err && <div className="admin-alert admin-alert-error">{err}</div>}

        <section className="admin-card">
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : users.length === 0 ? (
            <p>Không có tài khoản phù hợp.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Quyền</th>
                  <th style={{ width: 260 }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td className="admin-table-name">{u.full_name}</td>
                    <td className="admin-table-slug">{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value)}
                        style={{
                          fontSize: 12,
                          borderRadius: 6,
                          padding: "3px 6px",
                          background: "#020617",
                          color: "#e5e7eb",
                          border: "1px solid #4b5563",
                        }}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button className="admin-table-btn" onClick={() => openEdit(u)}>
                        Sửa
                      </button>
                      <button className="admin-table-btn" onClick={() => resetPassword(u)}>
                        Đặt lại mật khẩu
                      </button>
                      <button
                        className="admin-table-btn admin-table-btn-danger"
                        onClick={() => deleteUser(u)}
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* Modal TẠO tài khoản */}
      {createOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal" style={{ maxWidth: 600 }}>
            <div className="admin-modal-header">
              <h2>Tạo tài khoản</h2>
              <button className="admin-modal-close" onClick={() => setCreateOpen(false)}>
                ×
              </button>
            </div>
            <form className="admin-form" onSubmit={createUser}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Họ tên</label>
                  <input
                    value={newUser.full_name}
                    onChange={(e) => setNewUser((p) => ({ ...p, full_name: e.target.value }))}
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                    placeholder="email@domain.com"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Quyền</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Mật khẩu</label>
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Mật khẩu ban đầu"
                  />
                </div>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setCreateOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary">
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal SỬA tài khoản */}
      {editOpen && editUser && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal" style={{ maxWidth: 560 }}>
            <div className="admin-modal-header">
              <h2>Sửa tài khoản</h2>
              <button className="admin-modal-close" onClick={() => setEditOpen(false)}>
                ×
              </button>
            </div>

            {editErr && <div className="admin-alert admin-alert-error">{editErr}</div>}

            <form className="admin-form" onSubmit={saveEdit}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Họ tên</label>
                  <input
                    value={editUser.full_name}
                    onChange={(e) => setEditUser((p) => ({ ...p, full_name: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser((p) => ({ ...p, email: e.target.value }))}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Quyền</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser((p) => ({ ...p, role: e.target.value }))}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setEditOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
