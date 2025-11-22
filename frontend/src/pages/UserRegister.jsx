// src/pages/UserRegister.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";

export default function UserRegister() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [phone,   setPhone]     = useState("");
  const [address, setAddress]   = useState("");
  const [error,   setError]     = useState("");
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Vui lòng nhập Họ tên, Email và Mật khẩu.");
      return;
    }

    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          phone,
          address,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Đăng ký thất bại.");
        return;
      }

      // API đang trả luôn token + user → login luôn
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      console.error("Lỗi register:", err);
      setError("Không kết nối được tới server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Tạo tài khoản</h1>
        <p className="auth-sub">
          Mua sắm nhanh hơn, theo dõi đơn hàng và nhiều tiện ích khác.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Trần Văn A"
            />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
            />
          </div>

          <div className="auth-field auth-field-row">
            <div>
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
            <div>
              <label>Nhập lại mật khẩu</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Nhập lại mật khẩu"
              />
            </div>
          </div>

          <div className="auth-field auth-field-row">
            <div>
              <label>Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912 345 678"
              />
            </div>
            <div>
              <label>Địa chỉ</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, đường, phường, quận..."
              />
            </div>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Đang tạo tài khoản..." : "ĐĂNG KÝ"}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản?{" "}
          <button
            type="button"
            onClick={() => navigate("/dang-nhap")}
          >
            Đăng nhập ngay
          </button>
        </p>
      </div>
    </div>
  );
}
