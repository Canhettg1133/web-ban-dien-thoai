CREATE DATABASE IF NOT EXISTS mobile_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mobile_store;

-- Bảng người dùng
CREATE TABLE users (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(100) NOT NULL,
  email        VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone        VARCHAR(20),
  address      VARCHAR(255),
  role         ENUM('customer','admin') DEFAULT 'customer',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bảng danh mục sản phẩm
CREATE TABLE categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id   INT UNSIGNED NULL,
  CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES categories(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- Bảng sản phẩm
CREATE TABLE products (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id     INT UNSIGNED NOT NULL,
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(200) NOT NULL UNIQUE,
  description     TEXT,
  price           DECIMAL(12,2) NOT NULL,
  old_price       DECIMAL(12,2) DEFAULT NULL,
  stock           INT UNSIGNED DEFAULT 0,
  thumbnail       VARCHAR(255),        -- đường dẫn ảnh chính
  is_active       TINYINT(1) DEFAULT 1,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Bảng ảnh phụ của sản phẩm
CREATE TABLE product_images (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  image_url   VARCHAR(255) NOT NULL,
  is_main     TINYINT(1) DEFAULT 0,
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bảng đơn hàng
CREATE TABLE orders (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  full_name      VARCHAR(100) NOT NULL,   -- tên người nhận
  phone          VARCHAR(20) NOT NULL,
  address        VARCHAR(255) NOT NULL,
  total_amount   DECIMAL(12,2) NOT NULL,
  status         ENUM('pending','paid','shipping','completed','cancelled')
                  DEFAULT 'pending',
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Bảng chi tiết đơn hàng
CREATE TABLE order_items (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id     INT UNSIGNED NOT NULL,
  product_id   INT UNSIGNED NOT NULL,
  quantity     INT UNSIGNED NOT NULL,
  unit_price   DECIMAL(12,2) NOT NULL,   -- giá tại thời điểm mua
  CONSTRAINT fk_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT
) ENGINE=INNODB;
USE mobile_store;

-----------------------------------------------------
-- 1) DANH MỤC SẢN PHẨM
-----------------------------------------------------
INSERT INTO categories (name, slug, description) VALUES
('Điện thoại', 'dien-thoai', 'Các dòng smartphone'),
('Máy tính xách tay', 'laptop', 'Laptop văn phòng, gaming'),
('Phụ kiện', 'phu-kien', 'Tai nghe, sạc, ốp lưng');

-----------------------------------------------------
-- 2) TÀI KHOẢN ADMIN DEMO
--  password_hash tạm để "123456" (sau này bạn đổi sang hash bcrypt)
-----------------------------------------------------
INSERT INTO users (full_name, email, password_hash, phone, address, role) VALUES
('Quản trị viên', 'admin@mobile-store.local', '123456', '0912345678', 'Hà Nội', 'admin');

-----------------------------------------------------
-- 3) SẢN PHẨM MẪU (DÙNG CÁC ẢNH BẠN ĐƯA)
-----------------------------------------------------
INSERT INTO products (
  category_id, name, slug, description,
  price, old_price, stock, thumbnail, is_active
)
VALUES
  (
    (SELECT id FROM categories WHERE slug = 'dien-thoai'),
    'Điện thoại iPhone 16 Pro Max 256GB',
    'iphone-16-pro-max-256gb',
    'iPhone 16 Pro Max 256GB bản demo trong đồ án.',
    25400000, 27460000, 10,
    '/uploads/products/Ảnh chụp màn hình 2024-10-24 151935.png',
    1
  ),
  (
    (SELECT id FROM categories WHERE slug = 'dien-thoai'),
    'Điện thoại Samsung Galaxy A56 5G',
    'samsung-galaxy-a56-5g',
    'Samsung Galaxy A56 5G bản demo.',
    8410000, 9410000, 15,
    '/uploads/products/Ảnh chụp màn hình 2025-10-01 103228.png',
    1
  ),
  (
    (SELECT id FROM categories WHERE slug = 'dien-thoai'),
    'Điện thoại Xiaomi Redmi Note 12',
    'xiaomi-redmi-note-12',
    'Xiaomi Redmi Note 12 bản demo.',
    7990000, 9490000, 20,
    '/uploads/products/Ảnh chụp màn hình 2025-11-11 161750.png',
    1
  ),
  (
    (SELECT id FROM categories WHERE slug = 'laptop'),
    'Laptop Asus Vivobook 15',
    'laptop-asus-vivobook-15',
    'Laptop Asus Vivobook 15 bản demo.',
    25400000, 29500000, 8,
    '/uploads/products/Ảnh chụp màn hình 2024-10-24 151935.png',
    1
  ),
  (
    (SELECT id FROM categories WHERE slug = 'laptop'),
    'Laptop HP 14s Silver',
    'laptop-hp-14s-silver',
    'Laptop HP 14s Silver bản demo.',
    16000000, 18500000, 12,
    '/uploads/products/Ảnh chụp màn hình 2025-10-01 103228.png',
    1
  ),
  (
    (SELECT id FROM categories WHERE slug = 'laptop'),
    'Laptop Dell Inspiron 15',
    'laptop-dell-inspiron-15',
    'Laptop Dell Inspiron 15 bản demo.',
    19500000, 22000000, 5,
    '/uploads/products/Ảnh chụp màn hình 2025-11-11 161750.png',
    1
  );

-----------------------------------------------------
-- 4) ẢNH PHỤ CỦA SẢN PHẨM (nếu muốn demo)
-----------------------------------------------------
INSERT INTO product_images (product_id, image_url, is_main)
VALUES
  (
    (SELECT id FROM products WHERE slug = 'iphone-16-pro-max-256gb'),
    '/uploads/products/Ảnh chụp màn hình 2024-10-24 151935.png',
    1
  ),
  (
    (SELECT id FROM products WHERE slug = 'iphone-16-pro-max-256gb'),
    '/uploads/products/Ảnh chụp màn hình 2025-10-01 103228.png',
    0
  ),
  (
    (SELECT id FROM products WHERE slug = 'laptop-asus-vivobook-15'),
    '/uploads/products/Ảnh chụp màn hình 2025-11-11 161750.png',
    1
  );

INSERT INTO products (
  category_id,
  name,
  slug,
  description,
  price,
  old_price,
  stock,
  thumbnail,
  is_active
)
VALUES
  (
    (SELECT id FROM categories WHERE slug = 'phu-kien' LIMIT 1),
    'Tai nghe Bluetooth chụp tai Havi',
    'tai-nghe-bluetooth-chup-tai-havi',
    'Tai nghe Bluetooth chụp tai Havi, âm thanh sống động, phù hợp nghe nhạc, học online.',
    590000,
    690000,
    20,
    '/uploads/products/tai-nghe-bluetooth-chup-tai-havi.jpg',
    1
  ),
  (
    (SELECT id FROM categories WHERE slug = 'phu-kien' LIMIT 1),
    'Tai nghe Bluetooth mini',
    'tai-nghe-bluetooth-mini',
    'Tai nghe Bluetooth mini nhỏ gọn, kết nối ổn định, thích hợp mang theo mọi nơi.',
    390000,
    450000,
    30,
    '/uploads/products/images.jpg',
    1
  );
ALTER TABLE users ADD UNIQUE INDEX users_email_unique (email);
