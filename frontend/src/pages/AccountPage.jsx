// src/pages/AccountPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import { formatPrice } from "../utils";

const STATUS_LABEL = {
  pending: "Chờ xử lý",
  paid: "Đã thanh toán",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export default function AccountPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");

  const [activeTab, setActiveTab] = useState("info"); // info | orders | password

  // profile
  const [profile, setProfile] = useState(null);
  const [pLoading, setPLoading] = useState(true);
  const [pErr, setPErr] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  // orders
  const [orders, setOrders] = useState([]);
  const [oLoading, setOLoading] = useState(true);
  const [oErr, setOErr] = useState("");

  // order detail modal
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [dLoading, setDLoading] = useState(false);
  const [dErr, setDErr] = useState("");

  // password
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    if (!token) {
      localStorage.setItem("redirectAfterLogin", "/tai-khoan");
      navigate("/dang-nhap");
      return;
    }
    loadProfile();
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadProfile() {
    try {
      setPLoading(true);
      setPErr("");
      const res = await fetch(`${API_BASE}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Không tải được thông tin tài khoản.");
      setProfile(data);
    } catch (e) {
      setPErr(e.message || "Lỗi tải thông tin tài khoản.");
    } finally {
      setPLoading(false);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaveMsg("");
    setPErr("");
    try {
      const res = await fetch(`${API_BASE}/api/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone || "",
          address: profile.address || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Lưu thất bại.");
      setProfile(data);
      setSaveMsg("Đã lưu thông tin.");
      // đồng bộ localStorage userInfo (nếu bạn đang dùng ở chỗ khác)
      try {
        const cur = JSON.parse(localStorage.getItem("userInfo") || "{}");
        localStorage.setItem("userInfo", JSON.stringify({ ...cur, ...data }));
      } catch {}
    } catch (e) {
      setPErr(e.message || "Lưu thất bại.");
    }
  }

  async function loadOrders() {
    try {
      setOLoading(true);
      setOErr("");
      const res = await fetch(`${API_BASE}/api/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.message || "Không tải được đơn hàng.");
      setOrders(
        data.map((o) => ({ ...o, total_amount: Number(o.total_amount || 0) }))
      );
    } catch (e) {
      setOErr(e.message || "Lỗi tải đơn hàng.");
    } finally {
      setOLoading(false);
    }
  }

  async function openDetail(id) {
    try {
      setOpen(true);
      setDetail(null);
      setDErr("");
      setDLoading(true);
      const res = await fetch(`${API_BASE}/api/orders/my/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Không lấy được chi tiết.");
      setDetail(data);
    } catch (e) {
      setDErr(e.message || "Lỗi lấy chi tiết đơn.");
    } finally {
      setDLoading(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwMsg("");
    setPwErr("");
    try {
      const res = await fetch(`${API_BASE}/api/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: curPw,
          new_password: newPw,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Đổi mật khẩu thất bại.");
      setPwMsg("Đổi mật khẩu thành công.");
      setCurPw("");
      setNewPw("");
    } catch (e) {
      setPwErr(e.message || "Đổi mật khẩu thất bại.");
    }
  }

  return (
    <section className="account-page" style={{ padding: "20px 0" }}>
      <div className="container" style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 8 }}>Tài khoản của tôi</h1>
        <p style={{ color: "#6b7280", marginBottom: 16 }}>
          Quản lý thông tin cá nhân, đơn hàng đã mua và đổi mật khẩu.
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            className={`admin-btn-secondary ${activeTab === "info" ? "admin-menu-item-active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Thông tin
          </button>
          <button
            className={`admin-btn-secondary ${activeTab === "orders" ? "admin-menu-item-active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Đơn hàng
          </button>
          <button
            className={`admin-btn-secondary ${activeTab === "password" ? "admin-menu-item-active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            Đổi mật khẩu
          </button>
        </div>

        {/* CONTENT */}
        <div className="admin-card">
          {activeTab === "info" && (
            <>
              {pErr && <div className="admin-alert admin-alert-error">{pErr}</div>}
              {pLoading ? (
                <p>Đang tải...</p>
              ) : !profile ? (
                <p>Không có dữ liệu.</p>
              ) : (
                <form className="admin-form" onSubmit={saveProfile}>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Họ tên</label>
                      <input
                        value={profile.full_name || ""}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, full_name: e.target.value }))
                        }
                        placeholder="VD: Nguyễn Văn A"
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={profile.email || ""}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, email: e.target.value }))
                        }
                        placeholder="email@domain.com"
                      />
                    </div>
                  </div>

                  {/* Chỉ hiển thị nếu DB có cột phone/address */}
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Số điện thoại</label>
                      <input
                        value={profile.phone || ""}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, phone: e.target.value }))
                        }
                        placeholder="0912345678"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Địa chỉ</label>
                      <input
                        value={profile.address || ""}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, address: e.target.value }))
                        }
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                      />
                    </div>
                  </div>

                  <div className="admin-form-actions">
                    <button type="submit" className="admin-btn-primary">Lưu</button>
                  </div>

                  {saveMsg && <p style={{ color: "#86efac", marginTop: 8 }}>{saveMsg}</p>}
                </form>
              )}
            </>
          )}

          {activeTab === "orders" && (
            <>
              {oErr && <div className="admin-alert admin-alert-error">{oErr}</div>}
              {oLoading ? (
                <p>Đang tải đơn...</p>
              ) : orders.length === 0 ? (
                <p>Chưa có đơn hàng nào. <span
                  style={{ color: "#3b82f6", cursor: "pointer" }}
                  onClick={() => navigate("/san-pham")}
                >Mua sắm ngay</span>.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Người nhận</th>
                      <th>Liên hệ</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Thời gian</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>{o.full_name}</td>
                        <td>
                          <div>{o.phone}</div>
                          <div className="admin-table-slug">{o.address}</div>
                        </td>
                        <td>{formatPrice(o.total_amount)}</td>
                        <td>
                          <span
                            className={
                              o.status === "completed"
                                ? "admin-status admin-status-active"
                                : o.status === "cancelled"
                                ? "admin-status admin-status-inactive"
                                : "admin-status"
                            }
                          >
                            {STATUS_LABEL[o.status] || o.status}
                          </span>
                        </td>
                        <td>{o.created_at}</td>
                        <td>
                          <button
                            className="admin-table-btn"
                            onClick={() => openDetail(o.id)}
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* modal chi tiết đơn */}
              {open && (
                <div className="admin-modal-backdrop">
                  <div className="admin-modal" style={{ maxWidth: 800 }}>
                    <div className="admin-modal-header">
                      <h2>Chi tiết đơn hàng</h2>
                      <button className="admin-modal-close" onClick={() => setOpen(false)}>×</button>
                    </div>
                    {dLoading ? (
                      <p>Đang tải chi tiết...</p>
                    ) : dErr ? (
                      <div className="admin-alert admin-alert-error">{dErr}</div>
                    ) : !detail ? (
                      <p>Không có dữ liệu.</p>
                    ) : (
                      <>
                        <div style={{ marginBottom: 10, fontSize: 13 }}>
                          <p><strong>Mã đơn:</strong> #{detail.order.id}</p>
                          <p><strong>Người nhận:</strong> {detail.order.full_name}</p>
                          <p><strong>SĐT:</strong> {detail.order.phone}</p>
                          <p><strong>Địa chỉ:</strong> {detail.order.address}</p>
                          <p><strong>Tổng tiền:</strong> {formatPrice(detail.order.total_amount)}</p>
                          <p><strong>Trạng thái:</strong> {STATUS_LABEL[detail.order.status] || detail.order.status}</p>
                          <p><strong>Thời gian:</strong> {detail.order.created_at}</p>
                        </div>

                        <h3 style={{ fontSize: 14, marginBottom: 6 }}>Sản phẩm</h3>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Ảnh</th>
                              <th>Sản phẩm</th>
                              <th>SL</th>
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
                                <td className="admin-table-name">{it.product_name}</td>
                                <td>{it.quantity}</td>
                                <td>{formatPrice(Number(it.unit_price || 0))}</td>
                                <td>{formatPrice(Number(it.unit_price || 0) * it.quantity)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "password" && (
            <form className="admin-form" onSubmit={changePassword}>
              {pwErr && <div className="admin-alert admin-alert-error">{pwErr}</div>}
              {pwMsg && <p style={{ color: "#86efac" }}>{pwMsg}</p>}

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={curPw}
                    onChange={(e) => setCurPw(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-actions">
                <button className="admin-btn-primary" type="submit">Đổi mật khẩu</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
    