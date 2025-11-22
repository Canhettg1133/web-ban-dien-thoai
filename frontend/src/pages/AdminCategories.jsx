// src/pages/AdminCategories.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, fetchCategories } from "../api";

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function AdminCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' | 'edit'
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    slug: "",
    description: "",
    parent_id: "",
  });

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadCategories();
    // eslint-disable-next-line
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
      setError("Không tải được danh sách danh mục.");
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setFormMode("create");
    setFormData({
      id: null,
      name: "",
      slug: "",
      description: "",
      parent_id: "",
    });
    setFormOpen(true);
  }

  function openEditForm(c) {
    setFormMode("edit");
    setFormData({
      id: c.id,
      name: c.name || "",
      slug: c.slug || "",
      description: c.description || "",
      parent_id: c.parent_id || "",
    });
    setFormOpen(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !prev.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim()) {
      setError("Vui lòng nhập TÊN và SLUG danh mục.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim() || null,
      parent_id: formData.parent_id || null,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      let res;
      if (formMode === "create") {
        res = await fetch(`${API_BASE}/api/categories`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/api/categories/${formData.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Lưu danh mục thất bại.");
      }

      setFormOpen(false);
      setError("");
      await loadCategories();
    } catch (err) {
      console.error("Lỗi lưu danh mục:", err);
      setError(err.message || "Lỗi lưu danh mục.");
    }
  }

  async function handleDelete(c) {
    if (!window.confirm(`Xóa danh mục "${c.name}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/categories/${c.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Xóa danh mục thất bại.");
      }

      setCategories((prev) => prev.filter((item) => item.id !== c.id));
    } catch (err) {
      console.error("Lỗi xóa danh mục:", err);
      setError(err.message || "Lỗi xóa danh mục.");
    }
  }

  const catMap = {};
  categories.forEach((c) => {
    catMap[c.id] = c.name;
  });

  const filtered = categories.filter((c) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      c.slug.toLowerCase().includes(s)
    );
  });

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="admin-logo-main">MOBILE STORE</div>
          <div className="admin-logo-sub">ADMIN PANEL</div>
        </div>

<nav className="admin-menu">
  <button
    className="admin-menu-item"
    onClick={() => navigate("/admin/san-pham")}
  >
    <i className="fas fa-box" /> Sản phẩm
  </button>

  <button
    className="admin-menu-item admin-menu-item-active"
    onClick={() => navigate("/admin/danh-muc")}
  >
    <i className="fas fa-tags" /> Danh mục
  </button>

  <button
    className="admin-menu-item"
    onClick={() => navigate("/admin/don-hang")}
  >
    <i className="fas fa-receipt" /> Đơn hàng
  </button>
    <button
    className="admin-menu-item"
    onClick={() => navigate("/admin/tai-khoan")}
  >
    <i className="fas fa-users" /> Tài khoản
  </button>
</nav>

      </aside>

      <main className="admin-main">
        <header className="admin-main-header">
          <div>
            <h1>Quản lý danh mục</h1>
            <p>Tạo / sửa / xóa các nhóm sản phẩm.</p>
          </div>
          <button className="admin-btn-primary" onClick={openCreateForm}>
            + Thêm danh mục
          </button>
        </header>

        {error && (
          <div className="admin-alert admin-alert-error">{error}</div>
        )}

        <section className="admin-card">
          {/* THANH LỌC / TÌM KIẾM */}
          <div className="admin-filter-bar">
            <div className="admin-filter-group">
              <label>Tìm kiếm</label>
              <input
                type="text"
                placeholder="Nhập tên hoặc slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="admin-filter-info">
              Tổng: <strong>{categories.length}</strong> danh mục
            </div>
          </div>

          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : filtered.length === 0 ? (
            <p>Không có danh mục nào.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên danh mục</th>
                  <th>Slug</th>
                  <th>Mô tả</th>
                  <th>Danh mục cha</th>
                  <th style={{ width: "120px" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.slug}</td>
                    <td>{c.description || "-"}</td>
                    <td>
                      {c.parent_id
                        ? catMap[c.parent_id] || c.parent_id
                        : "-"}
                    </td>
                    <td>
                      <button
                        className="admin-table-btn"
                        onClick={() => openEditForm(c)}
                      >
                        Sửa
                      </button>
                      <button
                        className="admin-table-btn admin-table-btn-danger"
                        onClick={() => handleDelete(c)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {formOpen && (
          <div className="admin-modal-backdrop">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h2>
                  {formMode === "create" ? "Thêm danh mục" : "Sửa danh mục"}
                </h2>
                <button
                  className="admin-modal-close"
                  onClick={() => setFormOpen(false)}
                >
                  ×
                </button>
              </div>

              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Tên danh mục</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ví dụ: Laptop, Điện thoại..."
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Slug (đường dẫn)</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="vi-du: laptop, dien-thoai"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Danh mục cha (nếu có)</label>
                    <select
                      name="parent_id"
                      value={formData.parent_id}
                      onChange={handleChange}
                    >
                      <option value="">-- Không có --</option>
                      {categories
                        .filter((c) => c.id !== formData.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                    <small>Dùng khi muốn tạo danh mục con.</small>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Mô tả</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="admin-form-actions">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => setFormOpen(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="admin-btn-primary">
                    {formMode === "create" ? "Thêm mới" : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
