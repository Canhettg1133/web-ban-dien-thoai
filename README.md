# Đồ án: Website Bán Điện Thoại

## 1. Giới thiệu đề tài

Hệ thống **Website bán điện thoại** cho phép:

- **Khách hàng (User)**:
  - Xem danh sách điện thoại, phụ kiện.
  - Lọc theo hãng, khoảng giá, danh mục, trạng thái khuyến mãi.
  - Xem chi tiết sản phẩm, cấu hình, hình ảnh, giá, khuyến mãi.
  - Thêm sản phẩm vào giỏ hàng, cập nhật số lượng, xóa sản phẩm.
  - Đăng ký / đăng nhập tài khoản người dùng.
  - Đặt hàng và xem lại lịch sử đơn hàng (nếu có).

- **Quản trị viên (Admin)**:
  - Quản lý sản phẩm (thêm, sửa, xóa, ẩn/hiện).
  - Quản lý danh mục sản phẩm.
  - Quản lý khách hàng, đơn hàng.
  - Quản lý khuyến mãi (nếu có).
  - Xem thống kê doanh thu, đơn hàng, sản phẩm bán chạy (nếu đã triển khai).

Hệ thống được xây dựng theo mô hình:

- **Frontend**: Website giao diện người dùng (SPA) sử dụng React.
- **Backend**: RESTful API sử dụng Node.js + Express, kết nối CSDL MySQL.
- **Database**: MySQL / MariaDB, lưu trữ sản phẩm, tài khoản, đơn hàng, phân quyền, ...

---

## 2. Công nghệ sử dụng

- **Ngôn ngữ & Framework**
  - Frontend:
    - `React` (Vite)
    - `react-router-dom` (điều hướng trang)
    - `axios` (gọi API)
    - CSS thuần / Tailwind CSS / UI Library khác (tùy bạn đang dùng)
  - Backend:
    - `Node.js`
    - `Express.js`
    - `mysql2` (kết nối MySQL)
    - Có thể có: `cors`, `dotenv`, ...

- **Cơ sở dữ liệu**
  - `MySQL` / `MariaDB`
  - File export database:  
    `database/<MaSV>_WebBanDienThoai_DB.sql`  
    (ví dụ: `database/23012345_WebBanDienThoai_DB.sql`)

- **Thư viện chính (backend)**
  - `express`
  - `mysql2`
  - `dotenv`
  - `bcrypt` (mã hóa mật khẩu – nếu dùng)
  - `jsonwebtoken` (JWT auth – nếu dùng)
  - `multer` (upload ảnh sản phẩm – nếu dùng)

- **Thư viện chính (frontend)**
  - `react`
  - `react-dom`
  - `react-router-dom`
  - `axios`
  - UI lib: `tailwindcss` / `@mui/material` / `antd` (nếu có)

> *Ghi chú: Bạn có thể điều chỉnh lại danh sách thư viện cho đúng với `package.json` thực tế của dự án.*

---

## 3. Cấu trúc thư mục dự án

```text
.
├── backend/                           # Mã nguồn backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/              # Xử lý logic (productController, authController, orderController, ...)
│   │   ├── dao/                      # Truy vấn DB (productsDao, usersDao, categoriesDao, ...)
│   │   ├── middleware/               # Middleware (auth, error handler, ...)
│   │   ├── routes/                   # Định nghĩa route API (products.js, auth.js, orders.js, ...)
│   │   ├── config/ hoặc db.js        # Cấu hình & kết nối MySQL
│   │   └── app.js / server.js        # Điểm vào backend
│   ├── .env.example                  # Ví dụ cấu hình biến môi trường (không chứa mật khẩu thật)
│   ├── package.json
│   └── ...
│
├── frontend/                          # Mã nguồn frontend (React)
│   ├── src/
│   │   ├── pages/                    # Các trang: Home, ProductList, ProductDetail, Cart, Admin, ...
│   │   ├── components/               # Component dùng chung: Header, Footer, ProductCard, ...
│   │   ├── api/                      # Hàm gọi API backend (productsApi, authApi, ...)
│   │   ├── context/                  # CartContext, AuthContext, ...
│   │   ├── utils/                    # Hàm tiện ích (format giá, format ngày, ...)
│   │   └── main.jsx / App.jsx        # Điểm vào frontend
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── ...
│
├── database/
│   └── <MaSV>_WebBanDienThoai_DB.sql # File export MySQL theo đúng format yêu cầu
│       (VD: 23012345_WebBanDienThoai_DB.sql)
│
├── docs/                              # Thư mục chứa hình ảnh minh họa (không bắt buộc)
│   └── images/
│       ├── home.png
│       ├── product-detail.png
│       ├── cart.png
│       └── admin-dashboard.png
│
├── .gitignore
└── README.md                          # Tài liệu hướng dẫn này
