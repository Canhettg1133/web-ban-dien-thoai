// src/components/Header.jsx
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../CartContext";
import { formatPrice } from "../utils";
import { fetchCategories, searchProducts, API_BASE } from "../api";

export default function Header() {
  const { cartCount, cartTotal } = useContext(CartContext);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null); // khách hàng

  const [keyword, setKeyword] = useState("");            // từ khóa đang gõ
  const [suggestions, setSuggestions] = useState([]);    // danh sách gợi ý
  const [loadingSug, setLoadingSug] = useState(false);   // trạng thái loading
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Lấy danh mục từ backend cho menu
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await fetchCategories();
        setCategories(cats || []);
      } catch (err) {
        console.error("Lỗi load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Mỗi lần đổi route, đọc lại userInfo + đóng dropdown
  useEffect(() => {
    const raw = localStorage.getItem("userInfo");
    if (!raw) {
      setUser(null);
    } else {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }

    // đóng dropdown + clear keyword khi đổi trang
    setShowDropdown(false);
    // nếu không muốn clear text thì comment dòng dưới
    // setKeyword("");
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/");
  };

  // ====== GỌI API GỢI Ý MỖI KHI GÕ ======
  useEffect(() => {
    const q = keyword.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoadingSug(true);
    setShowDropdown(true);

    const timeoutId = setTimeout(() => {
      searchProducts(q)
        .then((data) => {
          const normalized = data.map((p) => ({
            ...p,
            price: Number(p.price),
            old_price: p.old_price ? Number(p.old_price) : null,
          }));
          // lấy tối đa 5 sản phẩm để gợi ý
          setSuggestions(normalized.slice(0, 5));
        })
        .catch((err) => {
          console.error("Lỗi search gợi ý:", err);
          setSuggestions([]);
        })
        .finally(() => setLoadingSug(false));
    }, 300); // debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [keyword]);

const goToSearchPage = () => {
  const q = keyword.trim();
  if (!q) return;
  setShowDropdown(false);
  navigate(`/san-pham?q=${encodeURIComponent(q)}`);
};



  const handleSearchSubmit = (e) => {
    e.preventDefault();
    goToSearchPage();
  };

  const handleClickSuggestion = (id) => {
    setShowDropdown(false);
    navigate(`/chi-tiet/${id}`);
  };

  const getDiscountPercent = (p) => {
    if (!p.old_price || !p.price || p.old_price <= p.price) return null;
    const diff = p.old_price - p.price;
    const percent = Math.round((diff / p.old_price) * 100);
    return percent;
  };

  // Khi mất focus ra ngoài input thì đóng dropdown (delay 100ms để kịp click)
  const handleBlurSearch = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 100);
  };

  return (
    <>
      {/* HEADER TRÊN */}
      <div className="header-top">
        <div className="header-logo">
          <div className="logo-circle">
            <div className="logo-phone-outline">
              <div className="logo-phone-screen" />
            </div>
          </div>
          <span className="logo-title">
            <span className="logo-main-text">MOBILE</span>
            <span className="logo-sub-text">STORE</span>
          </span>
        </div>

        {/* THANH TÌM KIẾM */}
        <div className="header-search">
          <form className="search-wrapper" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm điện thoại, laptop, phụ kiện..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                if (!showDropdown) setShowDropdown(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              onBlur={handleBlurSearch}
            />
            <button type="submit" className="search-icon-btn">
              <i className="fas fa-search" />
            </button>
          </form>

          {/* DROPDOWN GỢI Ý */}
          {showDropdown && keyword.trim().length >= 2 && (
            <div className="search-suggest-dropdown">
              <div className="search-suggest-header">
                {loadingSug ? "Đang tìm kiếm..." : "Sản phẩm gợi ý"}
              </div>

              {!loadingSug && suggestions.length === 0 && (
                <div className="search-suggest-empty">
                  Không tìm thấy sản phẩm phù hợp.
                </div>
              )}

              {!loadingSug &&
                suggestions.map((p) => {
                  const discount = getDiscountPercent(p);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className="search-suggest-item"
                      onMouseDown={(e) => e.preventDefault()} // tránh blur
                      onClick={() => handleClickSuggestion(p.id)}
                    >
                      <div className="search-suggest-thumb">
                        {p.thumbnail ? (
                          <img
                            src={API_BASE + p.thumbnail}
                            alt={p.name}
                          />
                        ) : (
                          <div className="thumb-placeholder" />
                        )}
                      </div>
                      <div className="search-suggest-info">
                        <p className="suggest-name">{p.name}</p>
                        <div className="suggest-price-row">
                          <span className="suggest-price">
                            {formatPrice(p.price)}
                          </span>
                          {p.old_price && (
                            <span className="suggest-old-price">
                              {formatPrice(p.old_price)}
                            </span>
                          )}
                          {discount && (
                            <span className="suggest-discount">
                              -{discount}%
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

              {!loadingSug && suggestions.length > 0 && (
                <button
                  type="button"
                  className="search-suggest-view-all"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSearchSubmit(new Event("submit"))}
                >
                  Xem tất cả kết quả cho "{keyword.trim()}"
                </button>
              )}
            </div>
          )}
        </div>

        {/* PHẦN TÀI KHOẢN + GIỎ HÀNG */}
        <div className="header-right-actions">
          {/* Tài khoản khách */}
          {!user ? (
            <button
              className="header-right-link"
              onClick={() => navigate("/dang-nhap")}
            >
              ĐĂNG NHẬP
            </button>
          ) : (
            <div className="header-account-dropdown">
              <Link
                to="/tai-khoan"
                className="header-right-link header-account-btn"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="header-account-name">
                  {user.full_name || user.email}
                </span>
                <i className="fas fa-chevron-down header-account-caret" />
              </Link>

              <div className="header-account-menu">
                <Link to="/tai-khoan" className="header-account-item">
                  <i className="far fa-user" />
                  <span>Tài khoản của tôi</span>
                </Link>

                <button
                  type="button"
                  className="header-account-item header-account-logout"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}

          {/* Giỏ hàng */}
          <Link to="/gio-hang" className="header-right-link cart-link">
            <span>
              GIỎ HÀNG ({cartCount}) /{" "}
              {cartTotal > 0 ? formatPrice(cartTotal) : "0đ"}
            </span>
            <span className="cart-count">{cartCount}</span>
          </Link>
        </div>
      </div>

      {/* NAV MAIN */}
      <nav className="main-nav">
        {/* Menu danh mục bên trái */}
        <div className="category-menu">
          <button className="category-toggle">
            <span className="category-icon">
              <i className="fas fa-bars" />
            </span>
            <span>Danh mục sản phẩm</span>
            <span className="category-caret">
              <i className="fas fa-chevron-down" />
            </span>
          </button>

          <div className="category-dropdown">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/san-pham/${c.slug}`}
                className="category-item"
              >
                {c.name}
              </Link>
            ))}
            <Link to="/san-pham" className="category-item">
              Tất cả sản phẩm
            </Link>
          </div>
        </div>

        {/* Menu giữa */}
        <ul className="nav-links">
          <li className="nav-item">
            <Link to="/">TRANG CHỦ</Link>
          </li>

          <li className="nav-item">
            <Link to="/gioi-thieu">GIỚI THIỆU</Link>
          </li>

          <li className="nav-item has-dropdown">
            <span className="nav-main-label">
              SẢN PHẨM <i className="fas fa-chevron-down nav-caret" />
            </span>

            <div className="nav-dropdown">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/san-pham/${c.slug}`}
                  className="nav-dropdown-item"
                >
                  {c.name}
                </Link>
              ))}
              <Link to="/san-pham" className="nav-dropdown-item">
                Tất cả sản phẩm
              </Link>
            </div>
          </li>

          <li className="nav-item">
            <Link to="/tin-tuc">TIN TỨC</Link>
          </li>

          <li className="nav-item">
            <Link to="/lien-he">LIÊN HỆ</Link>
          </li>
        </ul>

        <div className="nav-right-info">
          <div className="nav-info-block">
            <i className="far fa-clock" />
            <span>08:00 - 17:00</span>
          </div>
          <div className="nav-info-block">
            <i className="fas fa-phone-alt" />
            <span>0917304285</span>
          </div>
        </div>
      </nav>
    </>
  );
}
