// src/pages/HomePage.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../CartContext";
import { API_BASE, fetchProducts, fetchCategories } from "../api";
import { formatPrice } from "../utils";


function HeroSlider() {
  const slides = [
    {
      title: "THÁNG VÀNG LAPTOP",
      desc: "Giảm đến 30% cho sinh viên, giáo viên.",
      small: "Tặng kèm Microsoft Office bản quyền.",
      image: "/images/828aee5818229c8512f373520909b4bb.png",   // ảnh 1
    },
    {
      title: "ĐIỆN THOẠI GIẢM SỐC",
      desc: "iPhone, Samsung, Xiaomi giá tốt cuối tuần.",
      small: "Trả góp 0% lãi suất.",
      image: "/images/thumb S30 Pro mini.jpg",   // ảnh 2
    },
    {
      title: "PHỤ KIỆN ĐỒNG GIÁ",
      desc: "Tai nghe, sạc, ốp lưng chỉ từ 99.000đ.",
      small: "Mua kèm điện thoại giảm thêm 10%.",
      image: "/images/banner_1.jpg  ",   // ảnh 3
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setCurrent((p) => (p + 1) % slides.length),
      3000
    );
    return () => clearInterval(id);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <section className="hero-section">
      <div className="hero-inner">
        <div className="hero-left">
          <h1>{slide.title}</h1>
          <p className="hero-desc">{slide.desc}</p>
          <p className="hero-small">{slide.small}</p>
          <button className="hero-btn">Xem khuyến mãi</button>
        </div>

        <div className="hero-right">
          <img
            src={slide.image}
            alt={slide.title}
            className="hero-image"
          />
        </div>
      </div>

      <div className="hero-dots">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={`hero-dot ${idx === current ? "active" : ""}`}
          />
        ))}
      </div>
    </section>
  );
}


function DiscountSidebar() {
  const [discountProducts, setDiscountProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // lấy tất cả sản phẩm từ backend
        const data = await fetchProducts(); // không truyền category => lấy all

        // chuẩn hoá số
        const normalized = data.map((p) => ({
          ...p,
          price: Number(p.price),
          old_price: p.old_price ? Number(p.old_price) : null,
        }));

        // lọc sản phẩm có giảm giá (old_price > price)
        const discounts = normalized
          .filter((p) => p.old_price && p.old_price > p.price)
          // sắp xếp theo mức giảm nhiều -> ít
          .sort(
            (a, b) =>
              (b.old_price - b.price) - (a.old_price - a.price)
          )
          // lấy 4 sản phẩm đầu tiên
          .slice(0, 4);

        setDiscountProducts(discounts);
      } catch (err) {
        console.error("Lỗi tải sản phẩm giảm giá:", err);
        setDiscountProducts([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
  <aside className="discount-sidebar">
    <h3 className="sidebar-title">Sản phẩm giảm giá</h3>

    {loading ? (
      <p style={{ padding: "6px 14px" }}>Đang tải...</p>
    ) : discountProducts.length === 0 ? (
      <p style={{ padding: "6px 14px" }}>Chưa có sản phẩm giảm giá.</p>
    ) : (
      <>
        <div className="sidebar-list">
          {discountProducts.map((p) => (
            <Link
              key={p.id}
              to={`/chi-tiet/${p.id}`}
              className="sidebar-item-link"
            >
              <div className="sidebar-item">
                <div className="sidebar-thumb">
                  {p.thumbnail && (
                    <img
                      src={API_BASE + p.thumbnail}
                      alt={p.name}
                    />
                  )}
                </div>
                <div className="sidebar-text">
                  <p className="sidebar-name">{p.name}</p>
                  {p.old_price && (
                    <p className="sidebar-old">
                      {formatPrice(p.old_price)}
                    </p>
                  )}
                  <p className="sidebar-new">
                    {formatPrice(p.price)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Link xem tất cả sản phẩm giảm giá */}
        <Link
          to="/san-pham/giam-gia"
          className="discount-view-all"
        >
          Xem tất cả sản phẩm giảm giá &raquo;
        </Link>
      </>
    )}
  </aside>
);
}


function HomeTabs() {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);      // danh mục từ DB
  const [productsByCat, setProductsByCat] = useState({}); // { slug: [products] }
  const [activeCat, setActiveCat] = useState("");        // slug đang chọn
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // 1. Lấy tất cả danh mục
        const cats = await fetchCategories();

        // 2. Lấy tất cả sản phẩm (không truyền category => lấy all)
        const allProducts = await fetchProducts();

        // Chuẩn hoá giá
        const normalized = allProducts.map((p) => ({
          ...p,
          price: Number(p.price),
          old_price: p.old_price ? Number(p.old_price) : null,
        }));

        // 3. Group sản phẩm theo category_id
// 3. Group sản phẩm theo category_id (lấy tối đa 4 sp mới nhất)
      const grouped = {};
      cats.forEach((cat) => {
        const catProducts = normalized
          .filter((p) => p.category_id === cat.id)
          .sort((a, b) => (b.id ?? 0) - (a.id ?? 0)) // mới nhất trước
          .slice(0, 4);                               // GIỚI HẠN 4

        grouped[cat.slug] = catProducts;
      });


        setCategories(cats);
        setProductsByCat(grouped);

        // chọn tab đầu tiên
        if (cats.length > 0) {
          setActiveCat(cats[0].slug);
        }
      } catch (err) {
        console.error("Lỗi tải danh mục / sản phẩm trang chủ:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const visible = activeCat ? productsByCat[activeCat] || [] : [];

  const handleSeeAll = () => {
    if (!activeCat) return;
    // route dùng slug luôn: /san-pham/<slug>
    navigate(`/san-pham/${activeCat}`);
  };

  const handleAdd = (product) => {
    addToCart(product);
    alert(`Đã thêm "${product.name}" vào giỏ hàng (trang chủ, backend).`);
  };

  return (
    <section className="product-tabs">
      <div className="product-tabs-top">
        <div className="product-tabs-left">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              className={
                activeCat === cat.slug
                  ? "product-tab-btn active"
                  : "product-tab-btn"
              }
              onClick={() => setActiveCat(cat.slug)}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>

        {activeCat && (
          <button className="product-see-all" onClick={handleSeeAll}>
            Xem tất cả <i className="fas fa-chevron-right" />
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ padding: "10px" }}>Đang tải sản phẩm...</p>
      ) : !activeCat ? (
        <p style={{ padding: "10px" }}>Chưa có danh mục nào.</p>
      ) : visible.length === 0 ? (
        <p style={{ padding: "10px" }}>Danh mục này chưa có sản phẩm.</p>
      ) : (
        <div className="product-row-scroll">
          {visible.map((p) => (
            <div key={p.id} className="product-card">
              <Link
                to={`/chi-tiet/${p.id}`}
                className="product-thumb-link"
              >
                {p.thumbnail ? (
                  <img
                    src={API_BASE + p.thumbnail}
                    alt={p.name}
                    className="product-thumb"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="product-thumb" />
                )}
              </Link>

              <Link
                to={`/chi-tiet/${p.id}`}
                className="product-name-link"
              >
                <p className="product-name">{p.name}</p>
              </Link>

              {p.old_price && (
                <p className="product-old">
                  {formatPrice(p.old_price)}
                </p>
              )}
              <p className="product-price">
                {formatPrice(p.price)}
              </p>

              <button
                className="product-add-btn"
                onClick={() => handleAdd(p)}
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <section className="product-tabs-wrapper">
        <div className="product-layout-row">
          <div className="product-tabs-left-only">
            <HomeTabs />
          </div>
          <DiscountSidebar />
        </div>
      </section>
    </>
  );
}
