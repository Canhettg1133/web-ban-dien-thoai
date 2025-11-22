// src/pages/AdminProducts.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, fetchProducts, fetchCategories } from "../api";
import { formatPrice } from "../utils";

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filter giống dashboard của mấy web lớn
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' | 'edit'
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    slug: "",
    category_id: "",
    price: "",
    old_price: "",
    stock: "",
    thumbnail: "",
    description: "",
    is_active: true,
  });

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [cats, prods] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
      ]);

      setCategories(cats);

      setProducts(
        prods.map((p) => ({
          ...p,
          price: Number(p.price),
          old_price: p.old_price ? Number(p.old_price) : null,
          stock: p.stock != null ? Number(p.stock) : 0,
        }))
      );
    } catch (err) {
      console.error("Lỗi tải sản phẩm admin:", err);
      setError("Không tải được danh sách sản phẩm.");
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
      category_id: categories[0]?.id || "",
      price: "",
      old_price: "",
      stock: "",
      thumbnail: "",
      description: "",
      is_active: true,
    });
    setFormOpen(true);
  }

  function openEditForm(p) {
    setFormMode("edit");
    setFormData({
      id: p.id,
      name: p.name || "",
      slug: p.slug || "",
      category_id: p.category_id,
      price: p.price,
      old_price: p.old_price || "",
      stock: p.stock || "",
      thumbnail: p.thumbnail || "",
      description: p.description || "",
      is_active: p.is_active === 1 || p.is_active === true,
    });
    setFormOpen(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      let next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // tự tạo slug lần đầu theo tên
      if (name === "name" && !prev.slug) {
        next.slug = slugify(value);
      }

      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.slug.trim() ||
      !formData.category_id ||
      !formData.price
    ) {
      setError("Vui lòng nhập TÊN, SLUG, DANH MỤC và GIÁ.");
      return;
    }

    const payload = {
      category_id: Number(formData.category_id),
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      old_price: formData.old_price ? Number(formData.old_price) : null,
      stock: formData.stock ? Number(formData.stock) : 0,
      thumbnail: formData.thumbnail.trim() || null,
      is_active: formData.is_active ? 1 : 0,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      let res;
      if (formMode === "create") {
        res = await fetch(`${API_BASE}/api/products`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/api/products/${formData.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Lưu sản phẩm thất bại.");
      }

      setFormOpen(false);
      await loadData();
      setError("");
    } catch (err) {
      console.error("Lỗi lưu sản phẩm:", err);
      setError(err.message || "Lỗi lưu sản phẩm.");
    }
  }

  async function handleDelete(p) {
    if (!window.confirm(`Xóa sản phẩm "${p.name}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/products/${p.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Xóa sản phẩm thất bại.");
      }

      setProducts((prev) => prev.filter((item) => item.id !== p.id));
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      setError(err.message || "Lỗi xóa sản phẩm.");
    }
  }

  // map id -> tên danh mục
  const categoryMap = {};
  categories.forEach((c) => {
    categoryMap[c.id] = c.name;
  });

  // lọc giống admin của mấy web lớn:
  // - theo danh mục
  // - theo tên / slug (search)
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "all" && p.category_id !== Number(selectedCategory)) {
      return false;
    }
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.slug && p.slug.toLowerCase().includes(term))
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
    className="admin-menu-item admin-menu-item-active"
    onClick={() => navigate("/admin/san-pham")}
  >
    <i className="fas fa-box" /> Sản phẩm
  </button>

  <button
    className="admin-menu-item"
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
    <i className="fas fa-receipt" /> Tài khoản
  </button>

  <button
    className="admin-menu-item"
    onClick={() => navigate("/admin/thong-ke")}
  >
    <i className="fas fa-receipt" /> Thống Kê
  </button>

</nav>



      </aside>

      <main className="admin-main">
        <header className="admin-main-header">
          <div>
            <h1>Quản lý sản phẩm</h1>
            <p>Thêm / sửa / xóa sản phẩm hiển thị trên website.</p>
          </div>
          <button className="admin-btn-primary" onClick={openCreateForm}>
            + Thêm sản phẩm
          </button>
        </header>

        {/* thanh lọc trên cùng, giống dashboard chuyên nghiệp */}
        <div className="admin-filter-bar">
          <div className="admin-filter-group">
            <label>Danh mục</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-filter-group">
            <label>Tìm kiếm</label>
            <input
              type="text"
              placeholder="Nhập tên hoặc slug sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-filter-info">
            Đang hiển thị <strong>{filteredProducts.length}</strong> /{" "}
            {products.length} sản phẩm
          </div>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        <section className="admin-card">
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : filteredProducts.length === 0 ? (
            <p>Không có sản phẩm nào phù hợp bộ lọc.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Giá cũ</th>
                  <th>Kho</th>
                  <th>Trạng thái</th>
                  <th style={{ width: "120px" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.thumbnail && (
                        <img
                          src={API_BASE + p.thumbnail}
                          alt={p.name}
                          className="admin-table-thumb"
                        />
                      )}
                    </td>
                    <td className="admin-table-name">
                      {p.name}
                      <div className="admin-table-slug">{p.slug}</div>
                    </td>
                    <td>{categoryMap[p.category_id] || "-"}</td>
                    <td>{formatPrice(p.price)}</td>
                    <td>{p.old_price ? formatPrice(p.old_price) : "-"}</td>
                    <td>{p.stock ?? 0}</td>
                    <td>
                      <span
                        className={
                          p.is_active
                            ? "admin-status admin-status-active"
                            : "admin-status admin-status-inactive"
                        }
                      >
                        {p.is_active ? "Đang bán" : "Ẩn"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-table-btn"
                        onClick={() => openEditForm(p)}
                      >
                        Sửa
                      </button>
                      <button
                        className="admin-table-btn admin-table-btn-danger"
                        onClick={() => handleDelete(p)}
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
                  {formMode === "create" ? "Thêm sản phẩm" : "Sửa sản phẩm"}
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
                    <label>Danh mục</label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Trạng thái</label>
                    <label className="admin-switch">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                      />
                      <span />
                      <span className="admin-switch-label">
                        {formData.is_active ? "Đang bán" : "Ẩn"}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Tên sản phẩm</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ví dụ: iPhone 16 Pro Max 256GB"
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
                      placeholder="vi-du: iphone-16-pro-max-256gb"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Giá hiện tại (VND)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Giá cũ (nếu có)</label>
                    <input
                      type="number"
                      name="old_price"
                      value={formData.old_price}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Tồn kho</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Ảnh thumbnail</label>
                    <input
                      type="text"
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleChange}
                      placeholder="/uploads/products/ten-anh.jpg"
                    />
                    <small>
                      Hiện tại nhập đường dẫn ảnh. Sau này mình có thể làm
                      chức năng upload file riêng.
                    </small>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Mô tả</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
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
