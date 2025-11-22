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


## 4. Yêu cầu môi trường

Để chạy được hệ thống, máy cần cài đặt:

- **Node.js:** v18.x LTS (khuyến nghị)
- **npm:** >= 8.x
- **MySQL / MariaDB:**
  - MySQL 8.x hoặc MariaDB 10.x
- **Git:** để clone source từ GitHub

Nếu dùng Vite, khi chạy frontend lần đầu, nên đảm bảo port **5173** không bị trùng.

---

## 5. Hướng dẫn cài đặt & chạy chương trình

### 5.1. Clone source code

Mở terminal / CMD / PowerShell và chạy:

```bash
git clone https://github.com/Canhettg1133/web-ban-dien-thoai.git
cd web-ban-dien-thoai

5.2. Import database

Cách 1: Import qua phpMyAdmin

Mở XAMPP / MySQL server.

Truy cập: http://localhost/phpmyadmin

Bên trái, bấm New để tạo database mới (hoặc dùng lệnh SQL):

CREATE DATABASE Quan_Ly_Kho_Hang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


Chọn database Quan_Ly_Kho_Hang.

Chuyển sang tab Import.

Chọn file SQL: database/<MaSV>_WebBanDienThoai_DB.sql

Bấm Go để import dữ liệu.

Cách 2: Import qua MySQL CLI

mysql -u root -p Quan_Ly_Kho_Hang < database/<MaSV>_WebBanDienThoai_DB.sql


root: user MySQL (nếu bạn dùng user khác thì đổi lại).

Sau khi gõ lệnh, nhập password MySQL (nếu có).

5.3. Tạo file .env (cấu hình DB cho backend)

Trong thư mục backend/, tạo file .env (file này không commit lên Git):

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=Quan_Ly_Kho_Hang

PORT=3001
JWT_SECRET=ban_dien_thoai_2025


Giải thích:

DB_USER: username MySQL trên máy (thường là root).

DB_PASSWORD: mật khẩu MySQL (nếu bạn để trống thì có thể để DB_PASSWORD= hoặc xóa dòng).

DB_NAME: tên database vừa import (ví dụ: Quan_Ly_Kho_Hang).

PORT: port backend (mặc định 3001, có thể đổi nếu xung đột).

JWT_SECRET: chuỗi bí mật dùng để ký JWT.

5.4. Cài đặt & chạy Backend

Từ thư mục gốc dự án:

cd backend
npm install
npm run dev    # hoặc npm start, tùy script trong package.json


Backend sẽ chạy tại:
http://localhost:3001

5.5. Cài đặt & chạy Frontend

Mở terminal mới hoặc quay lại thư mục gốc:

cd ../frontend
npm install
npm run dev


Frontend mặc định chạy tại:
http://localhost:5173

Nếu trong code bạn có dùng biến môi trường Vite:

VITE_API_BASE=http://localhost:3001/api


thì tạo file .env trong thư mục frontend/ với nội dung như trên.

6. Tài khoản demo

Các tài khoản mẫu dùng để giảng viên / người chấm có thể đăng nhập nhanh:

⚠️ Hãy sửa lại phần dưới cho khớp với dữ liệu thật trong database (bảng ACCOUNT1 / users).

Ví dụ:

| Vai trò | Tài khoản    | Mật khẩu |
|---------|--------------|----------|
| Admin   | admin33333   | 123456   |
| User    | user1        | 123456   |


Bạn thay:

admin33333, user1, 123456 bằng đúng username/password mà bạn đang lưu trong DB.

7. Kết quả & hình ảnh minh họa

Một số giao diện chính của hệ thống:

Trang chủ

Hiển thị danh sách điện thoại nổi bật.

Có thanh tìm kiếm, bộ lọc theo hãng / mức giá.

Hiển thị banner khuyến mãi (nếu có).

Trang chi tiết sản phẩm

Hình ảnh sản phẩm.

Tên, giá, khuyến mãi, mô tả, cấu hình chi tiết.

Nút thêm vào giỏ hàng.

Trang giỏ hàng & đặt hàng

Danh sách sản phẩm trong giỏ.

Cập nhật số lượng, xóa sản phẩm.

Tính tổng tiền đơn hàng.

Form nhập thông tin khách hàng / xác nhận đặt hàng.

Trang đăng nhập / đăng ký

Form đăng nhập cho User/Admin.

Form đăng ký tài khoản mới (nếu có).

Trang Admin

Quản lý sản phẩm, danh mục, đơn hàng, khách hàng.

Có thể có biểu đồ/thống kê theo ngày/tháng (nếu đã triển khai).

### 7.1. Trang chủ

![Trang chủ](docs/images/home.png)

### 7.2. Trang chi tiết sản phẩm

![Chi tiết sản phẩm](docs/images/product-detail.png)

### 7.3. Trang giỏ hàng

![Giỏ hàng](docs/images/cart.png)

### 7.4. Trang đăng nhập

![Trang đăng nhập](docs/images/login.png)

### 7.5. Trang quản trị (Admin)

![Trang admin](docs/images/admin-dashboard.png)
yaml
Sao chép mã


