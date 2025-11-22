// src/pages/ProductPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { CartContext } from "../CartContext";
import {
  API_BASE,
  fetchProducts,
  fetchCategories,
  searchProducts,
} from "../api";
import { formatPrice } from "../utils";

// map để hỗ trợ cả đường dẫn cũ (/san-pham/phone) và slug mới trong DB
const CATEGORY_ALIAS = {
  phone: "dien-thoai",
  laptop: "laptop",
};

// slug đặc biệt cho trang “giảm giá”
const DISCOUNT_SLUG = "giam-gia";

export default function ProductPage() {
  const { category: categoryParam } = useParams();
  const location = useLocation();
  const { addToCart } = useContext(CartContext);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(0);
  const [sort, setSort] = useState("default");
  const [error, setError] = useState("");

  // đọc từ khoá từ query string: /san-pham?q=...
  const searchParams = new URLSearchParams(location.search);
  const keyword = (searchParams.get("q") || "").trim();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        // 1) Lấy danh mục (phục vụ sidebar)
        const cats = await fetchCategories();
        setCategories(cats || []);

        // 2) Nếu có từ khoá -> ưu tiên chế độ TÌM KIẾM
        if (keyword) {
          const rawSearch = await searchProducts(keyword);
          const withPriceNumber = (rawSearch || []).map((p) => ({
            ...p,
            price: Number(p.price),
            old_price: p.old_price ? Number(p.old_price) : null,
          }));

          setProducts(withPriceNumber);

          if (withPriceNumber.length) {
            const max = Math.max(...withPriceNumber.map((p) => p.price));
            setMaxPrice(max);
          } else {
            setMaxPrice(0);
          }

          setSort("default");
          return; // ❗ không chạy tiếp logic theo category
        }

        // 3) Không có keyword -> logic cũ theo category
        const isDiscountPage = categoryParam === DISCOUNT_SLUG;
        let slugForApi; // undefined = lấy tất cả

        if (categoryParam && categoryParam !== "all" && !isDiscountPage) {
          slugForApi = CATEGORY_ALIAS[categoryParam] || categoryParam;
        }

        // 4) Lấy sản phẩm theo slug (hoặc tất cả nếu không có slug / trang giảm giá)
        const raw = await fetchProducts(slugForApi);
        const withPriceNumber = (raw || []).map((p) => ({
          ...p,
          price: Number(p.price),
          old_price: p.old_price ? Number(p.old_price) : null,
        }));

        // 5) Nếu là trang giảm giá -> lọc lại tại FE
        const base = isDiscountPage
          ? withPriceNumber.filter(
              (p) => p.old_price && p.old_price > p.price
            )
          : withPriceNumber;

        setProducts(base);

        if (base.length) {
          const max = Math.max(...base.map((p) => p.price));
          setMaxPrice(max);
        } else {
          setMaxPrice(0);
        }

        setSort("default");
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        setProducts([]);
        setError("Không tải được danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [categoryParam, keyword]);

  // ====== RANGE GIÁ ======
  const minPrice =
    products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0;
  const maxPriceAll =
    products.length > 0 ? Math.max(...products.map((p) => p.price)) : 0;

  let filtered = products;
  if (maxPrice && maxPriceAll) {
    filtered = filtered.filter((p) => p.price <= maxPrice);
  }

  if (sort === "price-asc")
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc")
    filtered = [...filtered].sort((a, b) => b.price - a.price);

  // ====== DANH MỤC BÊN TRÁI ======
  const sideCategories = [
    { key: "all", label: "Tất cả sản phẩm" },
    { key: DISCOUNT_SLUG, label: "Sản phẩm giảm giá" },
    ...categories.map((c) => ({ key: c.slug, label: c.name })),
  ];

  let activeKey = "all";
  if (categoryParam && categoryParam !== "all") {
    activeKey =
      categoryParam === DISCOUNT_SLUG
        ? DISCOUNT_SLUG
        : CATEGORY_ALIAS[categoryParam] || categoryParam;
  }

  const currentCat =
    activeKey === "all"
      ? null
      : sideCategories.find((c) => c.key === activeKey) || null;

  const handleAdd = (p) => {
    addToCart(p);
    alert(`Đã thêm "${p.name}" vào giỏ hàng (dữ liệu từ backend).`);
  };

  if (loading) {
    return (
      <section className="product-page">
        <p>Đang tải sản phẩm...</p>
      </section>
    );
  }

  return (
    <section className="product-page">
      <div className="breadcrumb">
        <span>TRANG CHỦ / </span>
        <strong>SẢN PHẨM</strong>
        {keyword && (
          <>
            {" "}
            / <span>Kết quả cho "{keyword}"</span>
          </>
        )}
        {!keyword && currentCat && (
          <>
            {" "}
            / <span>{currentCat.label}</span>
          </>
        )}
      </div>

      {error && <p style={{ color: "red", marginBottom: 8 }}>{error}</p>}

      <div className="product-page-layout">
        {/* Cột trái */}
        <div>
          <div className="product-filter-box">
            <div className="filter-title">LỌC THEO GIÁ</div>
            {products.length > 0 ? (
              <>
                <div className="price-range">
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPriceAll}
                    step={100000}
                    value={maxPrice || maxPriceAll}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                  />
                </div>
                <button className="filter-btn">LỌC</button>
                <p className="filter-price-text">
                  Giá: {formatPrice(minPrice)} –{" "}
                  {formatPrice(maxPrice || maxPriceAll)}
                </p>
              </>
            ) : (
              <p>Không có sản phẩm.</p>
            )}
          </div>

          <div className="product-filter-box">
            <div className="filter-title">DANH MỤC SẢN PHẨM</div>
            <ul className="category-list">
              {sideCategories.map((c) => {
                const to = c.key === "all" ? "/san-pham" : `/san-pham/${c.key}`;
                return (
                  <li key={c.key}>
                    <Link
                      to={to}
                      className={
                        activeKey === c.key
                          ? "category-link active"
                          : "category-link"
                      }
                    >
                      {c.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Cột phải */}
        <div>
          <div className="product-page-header">
            <p className="result-count">
              {keyword
                ? `Hiển thị ${filtered.length} sản phẩm cho từ khóa "${keyword}"`
                : `Hiển thị ${filtered.length} sản phẩm${
                    currentCat ? ` trong "${currentCat.label}"` : ""
                  }`}
            </p>
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="default">Thứ tự mặc định</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>

          <div className="product-page-grid">
            {filtered.map((p) => {
              const discount =
                p.old_price && p.old_price > p.price
                  ? Math.round((1 - p.price / p.old_price) * 100)
                  : 0;

              return (
                <div key={p.id} className="product-page-card">
                  {discount > 0 && (
                    <span className="product-sale-badge">-{discount}%</span>
                  )}

                  <Link to={`/chi-tiet/${p.id}`} className="product-thumb-link">
                    {p.thumbnail ? (
                      <img
                        src={API_BASE + p.thumbnail}
                        alt={p.name}
                        className="product-page-thumb"
                      />
                    ) : (
                      <div className="product-page-thumb" />
                    )}
                  </Link>

                  <Link to={`/chi-tiet/${p.id}`} className="product-name-link">
                    <p className="product-page-name">{p.name}</p>
                  </Link>

                  {p.old_price && p.old_price > p.price && (
                    <p className="product-page-old">
                      {formatPrice(p.old_price)}
                    </p>
                  )}

                  <p className="product-page-price">{formatPrice(p.price)}</p>

                  <button
                    className="product-page-add-btn"
                    onClick={() => handleAdd(p)}
                  >
                    THÊM VÀO GIỎ HÀNG
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
