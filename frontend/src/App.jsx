// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// thêm import phía trên
import AdminOrders from "./pages/AdminOrders";


import "./App.css";
import "./styles/admin.css";
import "./styles/auth.css"; 
import CheckoutPage from "./pages/CheckoutPage";    
import "./styles/header-search.css";
import "./styles/search-page.css"; 

// SITE KHÁCH
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import AboutPage from "./pages/AboutPage";
import NewsPage from "./pages/NewsPage";
import ContactPage from "./pages/ContactPage";
import SearchPage from "./pages/SearchPage";


// ADMIN
import AdminLogin from "./pages/AdminLogin";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";

import Header from "./components/Header";
import { CartProvider } from "./CartContext";
import AdminUsers from "./pages/AdminUsers";
import AccountPage from "./pages/AccountPage";
import AdminDashboard from "./pages/AdminDashboard";

/* ========== FOOTER ========== */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-overlay" />
      <div className="footer-inner">
        <div className="footer-col footer-logo-col">
          <div className="footer-logo-box">
            <div className="logo-circle">
              <div className="logo-phone-outline">
                <div className="logo-phone-screen" />
              </div>
            </div>
            <div className="footer-logo-text">
              <span className="logo-main-text">MOBILE</span>
              <span className="logo-sub-text">STORE</span>
            </div>
          </div>

          <div className="footer-contact">
            <p>
              <i className="fas fa-map-marker-alt" /> 114/62 Phố Tân Phong, Hà Nội
            </p>
            <p>
              <i className="fas fa-phone-alt" /> 0917304285
            </p>
            <p>
              <i className="fas fa-phone-alt" /> 0852080383
            </p>
            <p>
              <i className="far fa-envelope" /> Tranvandat9029@gmail.com
            </p>
          </div>
        </div>

        <div className="footer-col">
          <h4>Về chúng tôi</h4>
          <a href="#">Trang chủ</a>
          <a href="#">Giới thiệu</a>
          <a href="#">Tin tức</a>
          <a href="#">Liên hệ</a>
        </div>

        <div className="footer-col">
          <h4>Thông tin</h4>
          <a href="#">Trang chủ</a>
          <a href="#">Giới thiệu</a>
          <a href="#">Tin tức</a>
          <a href="#">Liên hệ</a>
        </div>

        <div className="footer-col footer-term-col">
          <h4>Điều khoản</h4>
          <p className="footer-term-text">
            Điều khoản: Đăng ký email để nhận ngay mã giảm giá 200.000đ
            cho tất cả sản phẩm trên cửa hàng.
          </p>
          <div className="footer-email-form">
            <input type="text" placeholder="Nhập email của bạn" />
            <button>GỬI</button>
          </div>

          <div className="footer-social">
            <a href="#">
              <i className="fab fa-facebook-f" />
            </a>
            <a href="#">
              <i className="fab fa-instagram" />
            </a>
            <a href="#">
              <i className="fab fa-twitter" />
            </a>
            <a href="#">
              <i className="far fa-envelope" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ========== LAYOUT BÊN TRONG ROUTER ========== */

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="page">
      {/* Header/Footer chỉ cho site khách, không cho admin */}
      {!isAdminRoute && <Header />}

      <Routes>
        {/* SITE KHÁCH */}
        <Route path="/" element={<HomePage />} />
        <Route path="/san-pham" element={<ProductPage />} />
        <Route path="/san-pham/:category" element={<ProductPage />} />
        <Route path="/chi-tiet/:id" element={<ProductDetailPage />} />
        <Route path="/gio-hang" element={<CartPage />} />
        <Route path="/thanh-toan" element={<CheckoutPage />} />
        <Route path="/gioi-thieu" element={<AboutPage />} />
        <Route path="/tin-tuc" element={<NewsPage />} />
        <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/tim-kiem" element={<SearchPage />} />

        {/* Đăng nhập / đăng ký khách */}
        <Route path="/dang-nhap" element={<UserLogin />} />
        <Route path="/dang-ky" element={<UserRegister />} />

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/san-pham" element={<AdminProducts />} />
        <Route path="/admin/danh-muc" element={<AdminCategories />} />
         <Route path="/admin/don-hang" element={<AdminOrders />} />
         <Route path="/admin/tai-khoan" element={<AdminUsers />} />
         <Route path="/tai-khoan" element={<AccountPage />} />
         <Route path="/admin/thong-ke" element={<AdminDashboard />} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

/* ========== APP CHÍNH ========== */

export default function App() {
  return (
    <CartProvider>
      <Router>
        <AppLayout />
      </Router>
    </CartProvider>
  );
}

