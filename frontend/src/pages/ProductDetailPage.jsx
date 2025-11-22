import React, { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { CartContext } from "../CartContext";
import { API_BASE, fetchProductById, fetchProducts } from "../api";
import { formatPrice } from "../utils";
import "../styles/product-detail.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [qty, setQty] = useState(1);

  // gallery
  const [activeIdx, setActiveIdx] = useState(0);

  // related
  const [related, setRelated] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const p = await fetchProductById(id);
        const normalized = {
          ...p,
          price: Number(p.price),
          old_price: p.old_price ? Number(p.old_price) : null,
          stock: p.stock != null ? Number(p.stock) : null,
        };
        setProduct(normalized);
        setActiveIdx(0);

        // Lấy sản phẩm liên quan cùng category (tối đa 4)
        try {
          const all = await fetchProducts();
          const rel = (all || [])
            .filter(
              (x) =>
                x.id !== normalized.id &&
                x.category_id === normalized.category_id
            )
            .slice(0, 4)
            .map((x) => ({
              ...x,
              price: Number(x.price),
              old_price: x.old_price ? Number(x.old_price) : null,
            }));
          setRelated(rel);
        } catch {
          setRelated([]);
        }
      } catch (e) {
        console.error(e);
        setErr("Không tải được sản phẩm.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <section className="pd-page">
        <p>Đang tải sản phẩm...</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="pd-page">
        <div className="breadcrumb">
          <span>TRANG CHỦ / </span>
          <Link to="/san-pham" className="breadcrumb-link">
            SẢN PHẨM
          </Link>
          <span> / </span>
          <strong>KHÔNG TÌM THẤY</strong>
        </div>
        <p>{err || "Không tìm thấy sản phẩm."}</p>
      </section>
    );
  }

  const images = [product.thumbnail].filter(Boolean); // có 1 ảnh cũng chạy ngon
  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round((1 - product.price / product.old_price) * 100)
      : 0;

  const addManyToCart = () => {
    const n = Math.max(1, qty | 0);
    for (let i = 0; i < n; i += 1) addToCart(product);
    alert(`Đã thêm ${n} x "${product.name}" vào giỏ hàng.`);
  };

  return (
    <section className="pd-page">
      {/* breadcrumb */}
      <div className="breadcrumb">
        <span>TRANG CHỦ / </span>
        <Link to="/san-pham" className="breadcrumb-link">
          SẢN PHẨM
        </Link>
        <span> / </span>
        <strong>{product.name}</strong>
      </div>

      {/* layout chính */}
      <div className="pd-layout">
        {/* GALLERY */}
        <div className="pd-gallery">
          <div className="pd-main">
            {images[activeIdx] && (
              <img
                src={API_BASE + images[activeIdx]}
                alt={product.name}
                loading="lazy"
              />
            )}
            {discount > 0 && <span className="pd-badge">-{discount}%</span>}
          </div>

          <div className="pd-thumbs">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                className={i === activeIdx ? "pd-thumb active" : "pd-thumb"}
                onClick={() => setActiveIdx(i)}
                title={`Ảnh ${i + 1}`}
              >
                <img src={API_BASE + src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="pd-info">
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-meta">
            <span className="pd-sku">Mã: #{product.id}</span>
            {product.stock != null && (
              <span
                className={
                  product.stock > 0 ? "pd-stock ok" : "pd-stock out"
                }
              >
                {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
              </span>
            )}
          </div>

          <div className="pd-price-block">
            {product.old_price && (
              <span className="pd-old">{formatPrice(product.old_price)}</span>
            )}
            <span className="pd-price">{formatPrice(product.price)}</span>
          </div>

          <div className="pd-qty-row">
            <div className="pd-qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <input
                type="number"
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, Number(e.target.value) || 1))
                }
                min={1}
              />
              <button onClick={() => setQty((q) => q + 1)}>+</button>
            </div>

            <div className="pd-actions">
              <button className="pd-btn-primary" onClick={addManyToCart}>
                <i className="fas fa-cart-plus" /> Thêm vào giỏ
              </button>
              <Link
                to="/gio-hang"
                className="pd-btn-secondary"
                onClick={addManyToCart}
              >
                Mua ngay
              </Link>
            </div>
          </div>

          <ul className="pd-policies">
            <li>
              <i className="fas fa-shipping-fast" /> Giao nhanh 2h nội thành
            </li>
            <li>
              <i className="fas fa-undo" /> Đổi trả 7 ngày
            </li>
            <li>
              <i className="fas fa-shield-alt" /> Bảo hành 12 tháng
            </li>
          </ul>
        </div>
      </div>

      {/* MÔ TẢ / THÔNG TIN */}
      <div className="pd-desc">
        <h2>Mô tả sản phẩm</h2>
        <div className="pd-desc-content">
          {product.description || "Chưa có mô tả."}
        </div>
      </div>

      {/* SẢN PHẨM LIÊN QUAN */}
      {related.length > 0 && (
        <div className="pd-related">
          <div className="pd-related-head">
            <h3>Sản phẩm liên quan</h3>
            <Link to="/san-pham" className="pd-related-more">
              Xem thêm &raquo;
            </Link>
          </div>

          <div className="pd-related-grid">
            {related.map((p) => {
              const d =
                p.old_price && p.old_price > p.price
                  ? Math.round((1 - p.price / p.old_price) * 100)
                  : 0;
              return (
                <Link key={p.id} to={`/chi-tiet/${p.id}`} className="pd-card">
                  {d > 0 && <span className="pd-card-badge">-{d}%</span>}
                  <div className="pd-card-thumb">
                    {p.thumbnail ? (
                      <img src={API_BASE + p.thumbnail} alt={p.name} />
                    ) : (
                      <div />
                    )}
                  </div>
                  <p className="pd-card-name">{p.name}</p>
                  {p.old_price && (
                    <p className="pd-card-old">{formatPrice(p.old_price)}</p>
                  )}
                  <p className="pd-card-price">{formatPrice(p.price)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
