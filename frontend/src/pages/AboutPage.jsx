// src/pages/AboutPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/about.css";

export default function AboutPage() {
  const milestones = [
    { time: "03/2004", title: "Thành lập MobileStore", desc: "Khởi nghiệp bởi 5 nhà đồng sáng lập, tập trung kinh doanh thiết bị di động & TMĐT." },
    { time: "10/2004", title: "Khai trương siêu thị đầu tiên", desc: "Cửa hàng 89A Nguyễn Đình Chiểu (TP.HCM), tạo dấu ấn với tư vấn chuyên nghiệp." },
    { time: "2007 — 2009", title: "Mở rộng toàn quốc", desc: "Phủ sóng TP.HCM, Hà Nội, Đà Nẵng và nhiều tỉnh thành." },
    { time: "2010 — 2011", title: "Tăng tốc", desc: "Số siêu thị tăng gấp đôi 2010 và gần gấp 3 vào 2011." },
    { time: "2012 — nay", title: "Đa ngành bán lẻ", desc: "Tiếp tục mở rộng, nâng cấp trải nghiệm mua sắm đa kênh (omnichannel)." },
  ];

  const awards = [
    "Top 500 nhà bán lẻ hàng đầu Châu Á – Thái Bình Dương (2010)",
    "Top 5 tăng trưởng nhanh khu vực Châu Á – TBD (2010)",
    "Top 500 Fast VietNam (2010)",
    "Nhà bán lẻ được tín nhiệm nhiều năm liền (Vietnam Mobile Awards)",
    "Đa dạng mặt hàng & chăm sóc khách hàng xuất sắc",
    "Thương hiệu nổi tiếng tại Việt Nam (VCCI)",
    "Nhà bán lẻ của năm (PCWorld Việt Nam)",
  ];

  const headcounts = [
    ["12/2004", "13"],
    ["12/2005", "45"],
    ["12/2006", "109"],
    ["12/2007", "832"],
    ["12/2008", "1.037"],
    ["12/2009", "1.474"],
    ["12/2010", "3.107"],
    ["05/2012", "6.848"],
  ];

  return (
    <section className="about-page">
      {/* breadcrumb */}
      <div className="breadcrumb">
        <span>TRANG CHỦ / </span>
        <strong>GIỚI THIỆU</strong>
      </div>

      {/* hero */}
      <div className="about-hero">
        <div className="about-hero__text">
          <h1>MobileStore – Hệ sinh thái bán lẻ thiết bị số</h1>
          <p>
            Từ 2004 đến nay, chúng tôi theo đuổi sứ mệnh <b>“bán đúng – tư vấn thật – dịch vụ nhanh”</b>,
            mang lại trải nghiệm mua sắm minh bạch, tiện lợi cho hàng triệu khách hàng.
          </p>
          <div className="about-hero__cta">
            <Link to="/san-pham" className="about-btn about-btn--light">Mua sắm ngay</Link>
            <a href="#contact" className="about-btn about-btn--ghost">Liên hệ hợp tác</a>
          </div>
        </div>
        <div className="about-hero__stats">
          <div className="about-stat">
            <div className="about-stat__num">2004</div>
            <div className="about-stat__label">Năm thành lập</div>
          </div>
          <div className="about-stat">
            <div className="about-stat__num">63/63</div>
            <div className="about-stat__label">Tỉnh thành phủ sóng</div>
          </div>
          <div className="about-stat">
            <div className="about-stat__num">300K+</div>
            <div className="about-stat__label">Máy/tháng (demo)</div>
          </div>
          <div className="about-stat">
            <div className="about-stat__num">10K+</div>
            <div className="about-stat__label">Laptop/tháng (demo)</div>
          </div>
        </div>
      </div>

      {/* 2 columns: content + side card */}
      <div className="about-grid">
        <div>
          {/* formation */}
          <div className="about-card">
            <h2>1. Quá trình hình thành</h2>
            <p>
              MobileStore được thành lập tháng <b>03/2004</b>, hoạt động trong lĩnh vực mua bán – sửa chữa
              thiết bị di động, thiết bị kỹ thuật số và thương mại điện tử. Dựa trên hiểu biết thị trường từ
              những năm 1990 và nghiên cứu hành vi mua sắm của người Việt, chúng tôi xây dựng mô hình bán lẻ
              với <b>tư vấn chuyên nghiệp</b> và <b>kênh online</b> như một cẩm nang sản phẩm cho khách hàng.
            </p>
          </div>

          {/* development timeline */}
          <div className="about-card">
            <h2>2. Quá trình phát triển</h2>
            <div className="about-timeline">
              {milestones.map((m, i) => (
                <div key={i} className="about-timeline__item">
                  <div className="about-timeline__dot" />
                  <div className="about-timeline__time">{m.time}</div>
                  <div className="about-timeline__content">
                    <div className="about-timeline__title">{m.title}</div>
                    <div className="about-timeline__desc">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* awards */}
          <div className="about-card">
            <h2>3. Giải thưởng & ghi nhận</h2>
            <ul className="about-list">
              {awards.map((a, i) => (
                <li key={i}><i className="fas fa-check-circle" /> {a}</li>
              ))}
            </ul>
          </div>

          {/* headcount table */}
          <div className="about-card">
            <h2>4. Đội ngũ nhân sự</h2>
            <p>
              Cơ cấu gồm: Kiểm soát nội bộ, Tài chính, Hành chính – Nhân sự, Công nghệ thông tin, Kinh doanh – Tiếp thị.
              Quy mô nhân sự tăng trưởng mạnh qua các năm:
            </p>
            <div className="about-table">
              <div className="about-tr about-tr--head">
                <div>Năm</div>
                <div>Số lượng nhân viên</div>
              </div>
              {headcounts.map(([y, n]) => (
                <div key={y} className="about-tr">
                  <div>{y}</div>
                  <div>{n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* values */}
          <div className="about-card">
            <h2>5. Giá trị cốt lõi</h2>
            <div className="about-values">
              <div className="about-value">
                <i className="far fa-gem" />
                <h4>Chính trực</h4>
                <p>Tư vấn đúng – nói thật về tính năng, giá trị và trải nghiệm.</p>
              </div>
              <div className="about-value">
                <i className="fas fa-bolt" />
                <h4>Nhanh & gọn</h4>
                <p>Giao nhanh, đổi trả dễ, hỗ trợ 24/7 qua nhiều kênh.</p>
              </div>
              <div className="about-value">
                <i className="fas fa-heart" />
                <h4>Lấy khách hàng làm trung tâm</h4>
                <p>Mọi cải tiến đều hướng đến sự hài lòng của khách hàng.</p>
              </div>
            </div>
          </div>

          {/* policies */}
          <div className="about-card">
            <h2>6. Cam kết dịch vụ</h2>
            <ul className="about-list about-list--cols">
              <li><i className="fas fa-shipping-fast" /> Giao hàng toàn quốc</li>
              <li><i className="fas fa-undo" /> Đổi trả linh hoạt theo chính sách</li>
              <li><i className="far fa-credit-card" /> COD / chuyển khoản / trả góp</li>
              <li><i className="fas fa-headset" /> Hỗ trợ kỹ thuật & bảo hành tận tâm</li>
            </ul>
          </div>

          {/* contact */}
          <div id="contact" className="about-card">
            <h2>Liên hệ</h2>
            <p><i className="fas fa-map-marker-alt" /> 114/62 Phố Tân Phong, Hà Nội</p>
            <p><i className="fas fa-phone-alt" /> 0917304285 – 0852080383</p>
            <p><i className="far fa-envelope" /> Tranvandat9029@gmail.com</p>
          </div>
        </div>

        {/* side: fast facts */}
        <aside className="about-side">
          <div className="about-sidecard">
            <h3>Tin nhanh</h3>
            <ul>
              <li><i className="fas fa-check" /> Website có 1.2M+ lượt truy cập/ngày (demo).</li>
              <li><i className="fas fa-check" /> 500 mẫu điện thoại, 200 mẫu laptop cập nhật.</li>
              <li><i className="fas fa-check" /> Omnichannel: Online, siêu thị, tổng đài.</li>
            </ul>
            <Link to="/san-pham" className="about-btn about-btn--full">Khám phá sản phẩm</Link>
          </div>

          <div className="about-sidecard">
            <h3>Tuyển dụng</h3>
            <p>Gia nhập đội ngũ trẻ, năng động và giàu cơ hội phát triển.</p>
            <a className="about-btn about-btn--ghost about-btn--full" href="#">Xem vị trí mở</a>
          </div>
        </aside>
      </div>
    </section>
  );
}
