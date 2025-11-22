// src/pages/ContactPage.jsx
import React, { useState } from "react";
import "../styles/contact.css";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [msg, setMsg] = useState("");

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: gọi API backend nếu bạn có (ví dụ POST /api/contact)
    setMsg("Cảm ơn bạn! Chúng tôi đã nhận được thông tin và sẽ phản hồi sớm.");
    setForm({ name: "", phone: "", email: "", subject: "", message: "" });
  };

  return (
    <section className="contact-page">
      <div className="breadcrumb">
        <span>TRANG CHỦ / </span>
        <strong>LIÊN HỆ</strong>
      </div>

      {/* top cards */}
      <div className="contact-top">
        <div className="ct-card">
          <i className="fas fa-phone-alt" />
          <div>
            <h4>Hotline</h4>
            <p>0917304285 • 0852080383</p>
          </div>
        </div>
        <div className="ct-card">
          <i className="far fa-envelope" />
          <div>
            <h4>Email hỗ trợ</h4>
            <p>Tranvandat9029@gmail.com</p>
          </div>
        </div>
        <div className="ct-card">
          <i className="far fa-clock" />
          <div>
            <h4>Giờ làm việc</h4>
            <p>08:00 – 17:00 (T2–CN)</p>
          </div>
        </div>
      </div>

      {/* grid */}
      <div className="contact-grid">
        {/* form */}
        <div className="contact-card">
          <h2>Gửi yêu cầu hỗ trợ</h2>
          <p className="contact-sub">
            Điền biểu mẫu dưới đây, đội ngũ MobileStore sẽ liên hệ sớm.
          </p>
          {msg && <div className="contact-success">{msg}</div>}
          <form className="contact-form" onSubmit={onSubmit}>
            <div className="row">
              <div className="col">
                <label>Họ tên</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="col">
                <label>Số điện thoại</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="0912345678"
                />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  placeholder="email@domain.com"
                />
              </div>
              <div className="col">
                <label>Chủ đề</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={onChange}
                  placeholder="Cần tư vấn / Bảo hành / Góp ý…"
                />
              </div>
            </div>
            <div className="row">
              <div className="col col-full">
                <label>Nội dung</label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={onChange}
                  required
                  placeholder="Nhập nội dung cần hỗ trợ…"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="contact-btn">
                GỬI LIÊN HỆ
              </button>
            </div>
          </form>
        </div>

        {/* info */}
        <aside className="contact-info">
          <div className="contact-card">
            <h2>Thông tin cửa hàng</h2>
            <ul className="info-list">
              <li>
                <i className="fas fa-map-marker-alt" />
                114/62 Phố Tân Phong, Hà Nội
              </li>
              <li>
                <i className="fas fa-phone-alt" />
                0917304285 • 0852080383
              </li>
              <li>
                <i className="far fa-envelope" />
                Tranvandat9029@gmail.com
              </li>
              <li>
                <i className="far fa-clock" />
                08:00 – 17:00 (T2–CN)
              </li>
            </ul>
            <div className="contact-social">
              <a href="#"><i className="fab fa-facebook-f" /></a>
              <a href="#"><i className="fab fa-instagram" /></a>
              <a href="#"><i className="fab fa-twitter" /></a>
            </div>
          </div>

          <div className="contact-card">
            <h2>Bản đồ</h2>
            <div className="map-wrap">
              {/* có thể thay bằng iframe Google Maps địa chỉ thật */}
              <iframe
                title="map"
                src="https://maps.google.com/maps?q=Hanoi%20Vietnam&t=&z=12&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="240"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          </div>

          <div className="contact-card">
            <h2>Câu hỏi thường gặp</h2>
            <details className="faq">
              <summary>Thời gian giao hàng bao lâu?</summary>
              <p>Trong ngày tại nội thành; 1–3 ngày làm việc liên tỉnh.</p>
            </details>
            <details className="faq">
              <summary>Chính sách đổi trả thế nào?</summary>
              <p>Đổi lỗi do NSX trong 7–30 ngày tùy nhóm hàng, giữ nguyên hộp & phụ kiện.</p>
            </details>
            <details className="faq">
              <summary>Hình thức thanh toán?</summary>
              <p>COD, chuyển khoản, quẹt thẻ tại cửa hàng, trả góp lãi suất hấp dẫn.</p>
            </details>
          </div>
        </aside>
      </div>
    </section>
  );
}
