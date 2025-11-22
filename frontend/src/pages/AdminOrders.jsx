// src/pages/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import { formatPrice } from "../utils";

const ORDER_STATUSES = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "shipping", label: "Đang giao" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

// Sidebar giống AdminProducts
function AdminSidebar({ active }) {
  const navigate = useNavigate();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <div className="admin-logo-main">MOBILE ADMIN</div>
        <div className="admin-logo-sub">Quản lý cửa hàng</div>
      </div>

      <div className="admin-menu">
        <button
          className={
            active === "products"
              ? "admin-menu-item admin-menu-item-active"
              : "admin-menu-item"
          }
          onClick={() => navigate("/admin/san-pham")}
        >
          <i className="fas fa-box" />
          <span>Sản phẩm</span>
        </button>

        <button
          className={
            active === "categories"
              ? "admin-menu-item admin-menu-item-active"
              : "admin-menu-item"
          }
          onClick={() => navigate("/admin/danh-muc")}
        >
          <i className="fas fa-layer-group" />
          <span>Danh mục</span>
        </button>

        <button
          className={
            active === "orders"
              ? "admin-menu-item admin-menu-item-active"
              : "admin-menu-item"
          }
          onClick={() => navigate("/admin/don-hang")}
        >
          <i className="fas fa-file-invoice" />
          <span>Đơn hàng</span>
        </button>
          <button
    className="admin-menu-item"
    onClick={() => navigate("/admin/tai-khoan")}
  >
    <i className="fas fa-users" /> Tài khoản
  </button>
      </div>
    </aside>
  );
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // modal chi tiết đơn
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(data.message || "Không tải được danh sách đơn hàng.");
      }

      setOrders(
        data.map((o) => ({
          ...o,
          total_amount: Number(o.total_amount || 0),
        }))
      );
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      setError(err.message || "Lỗi tải đơn hàng.");
    } finally {
      setLoading(false);
    }
  }

  async function openOrderDetail(orderId) {
    try {
      setDetailOpen(true);
      setDetail(null);
      setDetailError("");
      setDetailLoading(true);

      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Không lấy được chi tiết đơn hàng.");
      }

      setDetail(data);
    } catch (err) {
      console.error("Lỗi chi tiết đơn:", err);
      setDetailError(err.message || "Lỗi lấy chi tiết đơn.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleChangeStatus(orderId, newStatus) {
    if (!window.confirm(`Cập nhật trạng thái đơn #${orderId} thành "${newStatus}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Cập nhật trạng thái thất bại.");
      }

      // cập nhật lại trong state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: newStatus,
              }
            : o
        )
      );
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert(err.message || "Cập nhật trạng thái thất bại.");
    }
  }

  // lọc theo trạng thái + search
  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== "all" && o.status !== selectedStatus) return false;
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    return (
      o.full_name.toLowerCase().includes(term) ||
      o.phone.toLowerCase().includes(term) ||
      (o.address && o.address.toLowerCase().includes(term)) ||
      (o.user_email && o.user_email.toLowerCase().includes(term)) ||
      String(o.id).includes(term)
    );
  });

  const renderStatusBadge = (status) => {
    const baseClass = "admin-status";
    if (status === "pending") return `${baseClass} admin-status-inactive`;
    if (status === "paid") return `${baseClass} admin-status-active`;
    if (status === "shipping") return `${baseClass} admin-status-active`;
    if (status === "completed") return `${baseClass} admin-status-active`;
    if (status === "cancelled") return `${baseClass} admin-status-inactive`;
    return baseClass;
  };

  const statusLabel = (st) =>
    ORDER_STATUSES.find((s) => s.value === st)?.label || st;

  return (
    <div className="admin-layout">
      <AdminSidebar active="orders" />

      <main className="admin-main">
        <header className="admin-main-header">
          <div>
            <h1>Quản lý đơn hàng</h1>
            <p>Xem, lọc và cập nhật trạng thái đơn hàng của khách.</p>
          </div>
        </header>

        {/* Thanh filter giống AdminProducts */}
        <div className="admin-filter-bar">
          <div className="admin-filter-group">
            <label>Trạng thái</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-filter-group">
            <label>Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên khách / SĐT / email / mã đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-filter-info">
            Đang hiển thị <strong>{filteredOrders.length}</strong> /{" "}
            {orders.length} đơn hàng
          </div>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error">{error}</div>
        )}

        <section className="admin-card">
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : filteredOrders.length === 0 ? (
            <p>Không có đơn hàng nào phù hợp bộ lọc.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th style={{ width: "180px" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>
                      <div className="admin-table-name">{o.full_name}</div>
                      <div className="admin-table-slug">
                        {o.user_email || ""}
                      </div>
                    </td>
                    <td>
                      <div>{o.phone}</div>
                      <div className="admin-table-slug">
                        {o.address || ""}
                      </div>
                    </td>
                    <td>{formatPrice(o.total_amount)}</td>
                    <td>
                      <span className={renderStatusBadge(o.status)}>
                        {statusLabel(o.status)}
                      </span>
                    </td>
                    <td>{o.created_at}</td>
                    <td>
                      <button
                        className="admin-table-btn"
                        onClick={() => openOrderDetail(o.id)}
                      >
                        Chi tiết
                      </button>

                      <select
                        value={o.status}
                        onChange={(e) =>
                          handleChangeStatus(o.id, e.target.value)
                        }
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          borderRadius: 6,
                          padding: "3px 6px",
                          background: "#020617",
                          color: "#e5e7eb",
                          border: "1px solid #4b5563",
                        }}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* MODAL chi tiết đơn */}
        {detailOpen && (
          <div className="admin-modal-backdrop">
            <div className="admin-modal" style={{ maxWidth: 800 }}>
              <div className="admin-modal-header">
                <h2>Chi tiết đơn hàng</h2>
                <button
                  className="admin-modal-close"
                  onClick={() => setDetailOpen(false)}
                >
                  ×
                </button>
              </div>

              {detailLoading ? (
                <p>Đang tải chi tiết...</p>
              ) : detailError ? (
                <div className="admin-alert admin-alert-error">
                  {detailError}
                </div>
              ) : !detail ? (
                <p>Không có dữ liệu.</p>
              ) : (
                <>
                  <div style={{ marginBottom: 10, fontSize: 13 }}>
                    <p>
                      <strong>Mã đơn:</strong> #{detail.order.id}
                    </p>
                    <p>
                      <strong>Khách hàng:</strong> {detail.order.full_name} (
                      {detail.order.user_email})
                    </p>
                    <p>
                      <strong>SĐT:</strong> {detail.order.phone}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {detail.order.address}
                    </p>
                    <p>
                      <strong>Tổng tiền:</strong>{" "}
                      {formatPrice(detail.order.total_amount)}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>{" "}
                      {statusLabel(detail.order.status)}
                    </p>
                    <p>
                      <strong>Thời gian:</strong> {detail.order.created_at}
                    </p>
                  </div>

                  <h3 style={{ fontSize: 14, marginBottom: 6 }}>
                    Sản phẩm trong đơn
                  </h3>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Ảnh</th>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items.map((it) => (
                        <tr key={it.id}>
                          <td>
                            {it.thumbnail && (
                              <img
                                src={API_BASE + it.thumbnail}
                                alt={it.product_name}
                                className="admin-table-thumb"
                              />
                            )}
                          </td>
                          <td className="admin-table-name">
                            {it.product_name}
                          </td>
                          <td>{it.quantity}</td>
                          <td>{formatPrice(Number(it.unit_price || 0))}</td>
                          <td>
                            {formatPrice(
                              Number(it.unit_price || 0) * it.quantity
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
