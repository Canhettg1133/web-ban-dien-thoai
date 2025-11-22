// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@mobile-store.local");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/admin-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        data = {};
      }

      console.log("Kết quả login:", res.status, data);

      if (!res.ok) {
        setError(data.message || `Đăng nhập thất bại (mã ${res.status}).`);
        return;
      }

      // lưu token + info admin
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminInfo", JSON.stringify(data.user));

      navigate("/admin/san-pham");
    } catch (err) {
      console.error("Lỗi gọi API login:", err);
      setError("Không kết nối được tới server.");
    } finally {
      setLoading(false); // LUÔN luôn chạy, nên nút sẽ trở lại bình thường
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <h1>Đăng nhập quản trị</h1>
        <p className="admin-login-sub">
          Chỉ dành cho tài khoản có vai trò <strong>admin</strong>.
        </p>

        {error && <p className="admin-login-error">{error}</p>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mobile-store.local"
            />
          </div>

          <div className="admin-login-field">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
          </button>
        </form>
      </div>
    </div>
  );
}
