// src/pages/CartPage.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";   // ⬅ thêm useNavigate
import { CartContext } from "../CartContext";
import { API_BASE } from "../api";
import { formatPrice } from "../utils";

export default function CartPage() {
  const { cartItems, removeFromCart, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();                       // ⬅ dùng điều hướng
  const token = localStorage.getItem("userToken");

  const handleCheckoutNow = () => {
    if (!cartItems.length) return;

    if (!token) {
      // chưa đăng nhập → lưu đường cần vào, đẩy sang /dang-nhap
      localStorage.setItem("redirectAfterLogin", "/thanh-toan");
      navigate("/dang-nhap");
    } else {
      // đã đăng nhập → sang trang thanh toán
      navigate("/thanh-toan");
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className="cart-page">
        <h1>Giỏ hàng</h1>
        <p>Giỏ hàng đang trống.</p>
        <Link to="/san-pham" className="cart-back-link">
          &laquo; Tiếp tục mua sắm
        </Link>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <h1>Giỏ hàng</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-thumb">
                {item.thumbnail && (
                  <img
                    src={API_BASE + item.thumbnail}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                )}
              </div>
              <div className="cart-info">
                <p className="cart-name">{item.name}</p>
                <p className="cart-price">
                  Đơn giá: {formatPrice(item.price)} x {item.quantity}
                </p>
                <p className="cart-subtotal">
                  Thành tiền:{" "}
                  {formatPrice(item.price * item.quantity)}
                </p>
                <button
                  className="cart-remove"
                  onClick={() => removeFromCart(item.id)}
                >
                  Xóa khỏi giỏ
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Tổng cộng</h2>
          <p className="cart-total">{formatPrice(cartTotal)}</p>

          {/* NÚT THANH TOÁN MỚI */}
          <button
            className="cart-checkout-btn"
            onClick={handleCheckoutNow}
          >
            Thanh toán ngay
          </button>
        </div>
      </div>
    </section>
  );
}
