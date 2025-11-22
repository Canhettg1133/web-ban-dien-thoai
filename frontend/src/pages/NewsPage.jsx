// src/pages/NewsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/news.css";
import { API_BASE } from "../api";

const DUMMY_POSTS = [
  {
    id: 1,
    title: "Top smartphone đáng mua tháng này",
    excerpt:
      "Danh sách những mẫu máy nổi bật về hiệu năng, camera, thời lượng pin kèm ưu đãi tốt.",
    category: "Tin khuyến mãi",
    cover: "/images/news-1.jpg",
    date: "2025-05-01",
  },
  {
    id: 2,
    title: "Laptop học tập – làm việc: chọn sao cho hợp",
    excerpt:
      "Gợi ý cấu hình, CPU, RAM, SSD và màn hình phù hợp nhu cầu văn phòng – sinh viên.",
    category: "Tư vấn mua sắm",
    cover: "/images/news-2.jpg",
    date: "2025-04-26",
  },
  {
    id: 3,
    title: "So sánh nhanh: Galaxy A vs Redmi Note",
    excerpt:
      "Hai dòng tầm trung hot: hiệu năng, camera, pin và giá bán – nên chọn bản nào?",
    category: "Đánh giá nhanh",
    cover: "/images/news-3.jpg",
    date: "2025-04-20",
  },
  {
    id: 4,
    title: "Phụ kiện dưới 300K đáng tiền",
    excerpt:
      "Cáp sạc PD, củ sạc nhanh, tai nghe có mic, đế sạc không dây… đáng mua trong tầm giá.",
    category: "Thủ thuật & phụ kiện",
    cover: "/images/news-4.jpg",
    date: "2025-04-15",
  },
  {
    id: 5,
    title: "Mẹo tối ưu pin iPhone/Android",
    excerpt:
      "Bật khoá nền hợp lý, tối ưu sạc, kiểm soát ứng dụng tiêu tốn năng lượng.",
    category: "Thủ thuật & phụ kiện",
    cover: "/images/news-5.jpg",
    date: "2025-03-30",
  },
  {
    id: 6,
    title: "Deal cuối tuần: giảm sâu điện thoại",
    excerpt:
      "Cuối tuần săn deal: nhiều mẫu giảm thêm tại cửa hàng và online, số lượng có hạn.",
    category: "Tin khuyến mãi",
    cover: "/images/news-6.jpg",
    date: "2025-03-28",
  },
];

const CATEGORIES = [
  "Tất cả",
  "Tin khuyến mãi",
  "Tư vấn mua sắm",
  "Đánh giá nhanh",
  "Thủ thuật & phụ kiện",
];

export default function NewsPage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("Tất cả");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // sau này thay bằng fetch API lấy tin tức
    setPosts(DUMMY_POSTS);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchCat = activeCat === "Tất cả" || p.category === activeCat;
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [posts, query, activeCat]);

  const featured = filtered[0];
  const others = filtered.slice(1);

  return (
    <section className="news-page">
      <div className="breadcrumb">
        <span>TRANG CHỦ / </span>
        <strong>TIN TỨC</strong>
      </div>

      {/* hero + search */}
      <div className="news-hero">
        <div className="news-hero__left">
          <h1>Góc Tin Tức MobileStore</h1>
          <p>Cập nhật khuyến mãi, đánh giá nhanh, mẹo dùng & tư vấn chọn máy.</p>
          <div className="news-search">
            <i className="fas fa-search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm bài viết, từ khóa…"
            />
          </div>
          <div className="news-cats">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={activeCat === c ? "news-cat active" : "news-cat"}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="news-hero__right">
          {featured ? (
            <Link to="#" className="news-featured">
              <div className="news-badge">{featured.category}</div>
              <div className="news-featured__thumb">
                <img
                  src={
                    featured.cover?.startsWith("/images/")
                      ? featured.cover
                      : API_BASE + featured.cover
                  }
                  alt={featured.title}
                />
              </div>
              <div className="news-featured__text">
                <h3>{featured.title}</h3>
                <p>{featured.excerpt}</p>
                <span className="news-meta">
                  <i className="far fa-clock" /> {featured.date}
                </span>
              </div>
            </Link>
          ) : (
            <div className="news-featured news-featured--placeholder" />
          )}
        </div>
      </div>

      {/* grid + sidebar */}
      <div className="news-grid">
        <div>
          <div className="news-cards">
            {others.map((p) => (
              <article className="news-card" key={p.id}>
                <div className="news-card__thumb">
                  {(p.cover && (
                    <img
                      src={
                        p.cover.startsWith("/images/")
                          ? p.cover
                          : API_BASE + p.cover
                      }
                      alt={p.title}
                    />
                  )) || <div className="news-thumb--ph" />}
                  <span className="news-chip">{p.category}</span>
                </div>
                <div className="news-card__body">
                  <Link to="#" className="news-title">
                    {p.title}
                  </Link>
                  <p className="news-excerpt">{p.excerpt}</p>
                  <div className="news-meta">
                    <i className="far fa-clock" /> {p.date}
                  </div>
                </div>
                <Link to="#" className="news-readmore">
                  Đọc tiếp <i className="fas fa-arrow-right" />
                </Link>
              </article>
            ))}
            {others.length === 0 && (
              <p style={{ padding: 12 }}>Không có bài viết nào phù hợp.</p>
            )}
          </div>
        </div>

        <aside className="news-side">
          <div className="news-sidecard">
            <h3>Bài viết nổi bật</h3>
            <ul>
              {posts.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link to="#">{p.title}</Link>
                  <span>{p.date}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="news-sidecard">
            <h3>Đăng ký nhận tin</h3>
            <p>Ưu đãi sớm & bài viết mới mỗi tuần.</p>
            <div className="news-subscribe">
              <input type="email" placeholder="Nhập email của bạn" />
              <button>Đăng ký</button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
