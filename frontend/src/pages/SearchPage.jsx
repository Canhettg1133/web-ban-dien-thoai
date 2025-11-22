// src/pages/SearchPage.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { CartContext } from "../CartContext";
import { searchProducts, fetchCategories, API_BASE } from "../api";
import { formatPrice } from "../utils";

// hook nhỏ để đọc query string
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchPage() {
  const { addToCart } = useContext(CartContext);
  const query = useQuery();
  const q = query.get("q") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // filter/sort
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  // load categories 1 lần
  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats || []))
      .catch((err) => console.error("Lỗi load categories:", err));
  }, []);

  // gọi API search mỗi khi q thay đổi
  useEffect(() => {
    const keyword = q.trim();
    if (!keyword) {
      setProducts([]);
      return;
    }

    setLoading(true);
    searchProducts(keyword)
      .then((data) => {
        const normalized = data.map((p) => ({
          ...p,
          price: Number(p.price),
          old_price: p.old_price ? Number(p.old_price) : null,
        }));
        setProducts(normalized);
      })
      .catch((err) => {
        console.error("Lỗi tải kết quả tìm kiếm:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [q]);

  const categoryMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => {
      m[c.id] = c.name;
    });
    return m;
  }, [categories]);

  // filter theo khoảng giá
  const matchPriceRange = (p) => {
    const price = Number(p.price) || 0;
    switch (priceRange) {
      case "under-2":
        return price > 0 && price <= 2_000_000;
      case "2-5":
        return price > 2_000_000 && price <= 5_000_000;
      case "5-10":
        return price > 5_000_000 && price <= 10_000_000;
      case "over-10":
        return price > 10_000_000;
      default:
        return true;
    }
  };

  const getDiscount = (p) => {
    if (!p.old_price || !p.price || p.old_price <= p.price) return 0;
    return p.old_price - p.price;
  };

  // áp dụng filter + sort
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== "all") {
      const catId = Number(selectedCategory);
      list = list.filter((p) => p.category_id === catId);
    }

    list = list.filter(matchPriceRange);

    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        break;
      case "discount":
        list.sort((a, b) => getDiscount(b) - getDiscount(a));
        break;
      default:
        // relevance: giữ thứ tự backend trả về
        break;
    }

    return list;
  }, [products, selectedCategory, priceRange, sortBy]);

  const handleAdd = (product) => {
    addToCart(product);
    alert(`Đã thêm "${product.name}" vào giỏ hàng (trang tìm kiếm).`);
  };

  return (
    <section className="search-page">
      {/* HERO GIỐNG WEB LỚN */}
      <div className="search-hero">
        <div className="search-hero-inner">
          <div className="search-hero-left">
            <h1>
              Kết quả cho{" "}
              <span className="search-keyword">"{q.trim() || "..."}"</span>
            </h1>
            <p>
              Gợi ý sản phẩm điện thoại, laptop, phụ kiện phù hợp với nhu cầu
              của bạn.
            </p>
            {!loading && q.trim() && (
              <p className="search-hero-count">
                Tìm thấy{" "}
                <strong>{filteredProducts.length}</strong> sản phẩm phù hợp
              </p>
            )}
          </div>
          <div className="search-hero-right">
            <div className="search-hero-tag">
              <i className="fas fa-shipping-fast" /> Giao nhanh trong ngày
            </div>
            <div className="search-hero-tag">
              <i className="far fa-credit-card" /> Trả góp 0% lãi suất
            </div>
            <div className="search-hero-tag">
              <i className="fas fa-shield-alt" /> Hàng chính hãng, bảo hành 12
              - 24 tháng
            </div>
          </div>
        </div>
      </div>

      {/* LAYOUT: SIDEBAR + MAIN */}
      <div className="search-layout">
        {/* SIDEBAR FILTER */}
        <aside className="search-sidebar">
          <div className="search-sidebar-section">
            <h3>Danh mục</h3>
            <ul className="search-filter-list">
              <li
                className={
                  selectedCategory === "all"
                    ? "search-filter-item active"
                    : "search-filter-item"
                }
                onClick={() => setSelectedCategory("all")}
              >
                <span>Tất cả</span>
              </li>
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className={
                    selectedCategory === String(cat.id)
                      ? "search-filter-item active"
                      : "search-filter-item"
                  }
                  onClick={() => setSelectedCategory(String(cat.id))}
                >
                  <span>{cat.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="search-sidebar-section">
            <h3>Khoảng giá (VNĐ)</h3>
            <ul className="search-filter-list">
              <li
                className={
                  priceRange === "all"
                    ? "search-filter-item active"
                    : "search-filter-item"
                }
                onClick={() => setPriceRange("all")}
              >
                <span>Tất cả mức giá</span>
              </li>
              <li
                className={
                  priceRange === "under-2"
                    ? "search-filter-item active"
                    : "search-filter-item"
                }
                onClick={() => setPriceRange("under-2")}
              >
                <span>Đến 2.000.000đ</span>
              </li>
              <li
                className={
                  priceRange === "2-5"
                    ? "search-filter-item active"
                    : "search-filter-item"
                }
                onClick={() => setPriceRange("2-5")}
              >
                <span>2.000.000đ - 5.000.000đ</span>
              </li>
              <li
                className={
                  priceRange === "5-10"
                    ? "search-filter-item active"
                    : "search-filter-item"
                }
                onClick={() => setPriceRange("5-10")}
              >
                <span>5.000.000đ - 10.000.000đ</span>
              </li>
              <li
                className={
                  priceRange === "over-10"
                    ? "search-filter-item active"
                    : "search-filter-item"
                }
                onClick={() => setPriceRange("over-10")}
              >
                <span>Trên 10.000.000đ</span>
              </li>
            </ul>
          </div>

          <div className="search-sidebar-section">
            <div className="hint-box">
              <h3>Mẹo tìm kiếm</h3>
              <p>- Gõ tên model: "iPhone 15 Pro Max"</p>
              <p>- Gõ hãng: "Samsung", "OPPO"</p>
              <p>- Gõ loại: "laptop gaming", "tai nghe"</p>
            </div>
          </div>
        </aside>

        {/* MAIN RESULT */}
        <main className="search-main">
          <div className="search-toolbar">
            <div className="search-result-count">
              {loading ? (
                <span>Đang tìm kiếm sản phẩm...</span>
              ) : !q.trim() ? (
                <span>Vui lòng nhập từ khóa vào ô tìm kiếm.</span>
              ) : filteredProducts.length === 0 ? (
                <span>
                  Không tìm thấy sản phẩm nào cho{" "}
                  <strong>"{q.trim()}"</strong>.
                </span>
              ) : (
                <span>
                  Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm
                  cho từ khóa <strong>"{q.trim()}"</strong>.
                </span>
              )}
            </div>

            <div className="search-sort">
              <span>Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Phù hợp nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="newest">Mới nhất</option>
                <option value="discount">Khuyến mãi nhiều</option>
              </select>
            </div>
          </div>

          {/* GRID SẢN PHẨM */}
          {!loading && filteredProducts.length > 0 && (
            <div className="search-result-grid">
              {filteredProducts.map((p) => {
                const discount = getDiscount(p);
                const discountPercent =
                  p.old_price && p.old_price > p.price
                    ? Math.round((discount / p.old_price) * 100)
                    : 0;

                return (
                  <div key={p.id} className="search-product-card">
                    <div className="search-product-thumb-wrapper">
                      <Link
                        to={`/chi-tiet/${p.id}`}
                        className="product-thumb-link"
                      >
                        {p.thumbnail ? (
                          <img
                            src={API_BASE + p.thumbnail}
                            alt={p.name}
                            className="search-product-thumb"
                          />
                        ) : (
                          <div className="search-product-thumb placeholder" />
                        )}
                      </Link>

                      {discountPercent > 0 && (
                        <span className="search-badge-discount">
                          -{discountPercent}%
                        </span>
                      )}

                      <button
                        type="button"
                        className="search-favorite-btn"
                      >
                        <i className="far fa-heart" />
                      </button>
                    </div>

                    <div className="search-product-body">
                      <Link
                        to={`/chi-tiet/${p.id}`}
                        className="product-name-link"
                      >
                        <p className="search-product-name">{p.name}</p>
                      </Link>

                      <div className="search-price-row">
                        <span className="search-product-price">
                          {formatPrice(p.price)}
                        </span>
                        {p.old_price && (
                          <span className="search-product-old-price">
                            {formatPrice(p.old_price)}
                          </span>
                        )}
                      </div>

                      <div className="search-product-subinfo">
                        {categoryMap[p.category_id] && (
                          <span>
                            <i className="fas fa-list" />
                            {categoryMap[p.category_id]}
                          </span>
                        )}
                        <span>
                          <i className="fas fa-shipping-fast" />
                          Giao nhanh
                        </span>
                        <span>
                          <i className="far fa-credit-card" />
                          Trả góp 0%
                        </span>
                      </div>

                      <button
                        className="search-add-cart-btn"
                        onClick={() => handleAdd(p)}
                      >
                        <i className="fas fa-cart-plus" />
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
