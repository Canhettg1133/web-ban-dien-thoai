// src/pages/CheckoutPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../CartContext";
import { API_BASE } from "../api";
import { formatPrice } from "../utils";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cartCtx = useContext(CartContext);

  // TUỲ CartContext của bạn, đổi lại tên nếu cần
  const cartItems = cartCtx.cartItems || cartCtx.cart || cartCtx.items || [];
  const cartTotal = cartCtx.cartTotal ?? cartCtx.total ?? 0;
  const clearCart =
    typeof cartCtx.clearCart === "function" ? cartCtx.clearCart : null;

  const token = localStorage.getItem("userToken");
  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo")) || null;
    } catch {
      return null;
    }
  })();

  const [fullName, setFullName] = useState(userInfo?.full_name || "");
  const [phone, setPhone] = useState(userInfo?.phone || "");
  const [address, setAddress] = useState(userInfo?.address || "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Nếu vào trực tiếp /thanh-toan mà chưa đăng nhập → đẩy về login
  useEffect(() => {
    if (!token) {
      // nhớ đường quay lại
      localStorage.setItem("redirectAfterLogin", "/thanh-toan");
      navigate("/dang-nhap");
    }
  }, [token, navigate]);

  // Nếu giỏ trống → quay lại /gio-hang
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/gio-hang");
    }
  }, [cartItems.length, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setError("Vui lòng nhập Họ tên, Số điện thoại và Địa chỉ.");
      return;
    }

    if (!cartItems.length) {
      setError("Giỏ hàng trống, không thể đặt hàng.");
      return;
    }

    const items = cartItems.map((item) => ({
      product_id: item.id,
      quantity: item.quantity || 1,
    }));

    const payload = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      items,
      note: note.trim(),
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Đặt hàng thất bại.");
        return;
      }

      setSuccess("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
      if (clearCart) clearCart();
      // sau thành công có thể điều hướng sang trang khác nếu muốn
      // navigate("/don-hang-cua-toi");
    } catch (err) {
      console.error("Lỗi tạo đơn:", err);
      setError("Không kết nối được tới server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="checkout-page">
      <div className="checkout-container">
        {/* Form bên trái */}
        <div className="checkout-left">
          <h1>Thanh toán</h1>
          <p className="checkout-sub">
            Vui lòng kiểm tra thông tin và xác nhận đặt hàng.
          </p>

          {error && <div className="checkout-alert error">{error}</div>}
          {success && <div className="checkout-alert success">{success}</div>}

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="checkout-row">
              <div className="checkout-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
            </div>

            <div className="checkout-row">
              <div className="checkout-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0912345678"
                />
              </div>
              <div className="checkout-group">
                <label>Địa chỉ nhận hàng</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                />
              </div>
            </div>

            <div className="checkout-row">
              <div className="checkout-group">
                <label>Ghi chú (tuỳ chọn)</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
                />
              </div>
            </div>

            <div className="checkout-actions">
              <button
                type="button"
                className="checkout-btn secondary"
                onClick={() => navigate("/gio-hang")}
              >
                &laquo; Quay lại giỏ hàng
              </button>
              <button
                type="submit"
                className="checkout-btn primary"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </button>
            </div>
          </form>
        </div>

        {/* Tóm tắt đơn bên phải */}
        <div className="checkout-right">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="checkout-summary-list">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-summary-item">
                <div className="checkout-summary-info">
                  <div className="name">{item.name}</div>
                  <div className="meta">SL: {item.quantity || 1}</div>
                </div>
                <div className="checkout-summary-price">
                  {formatPrice(Number(item.price || 0))}
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-summary-total">
            <span>Tổng cộng</span>
            <strong>{formatPrice(cartTotal || 0)}</strong>
          </div>

          <p className="checkout-note">
            Hiện tại thanh toán khi nhận hàng (COD). Sau này bạn có thể
            tích hợp VNPay, Momo,... như các trang thương mại điện tử lớn.
          </p>
        </div>
      </div>
    </section>
  );
}
