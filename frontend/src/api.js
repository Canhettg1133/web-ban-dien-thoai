// src/api.js
export const API_BASE = "http://localhost:5000"; // KHÔNG có /api phía sau

// ================== SẢN PHẨM (CLIENT) ==================

// lấy danh sách sản phẩm (có thể lọc theo category)
export async function fetchProducts(categorySlug) {
  let url = `${API_BASE}/api/products`;
  if (categorySlug) {
    url += `?category=${categorySlug}`; // vd: 'laptop', 'dien-thoai'
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error("Lỗi lấy danh sách sản phẩm");
  return res.json();
}

// lấy chi tiết 1 sản phẩm
export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/api/products/${id}`);
  if (!res.ok) throw new Error("Lỗi lấy chi tiết sản phẩm");
  return res.json();
}

// lấy loại sản phẩm
export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) throw new Error("Lỗi lấy danh mục");
  return res.json();
}

// 🔍 TÌM KIẾM SẢN PHẨM (header gợi ý + trang /tim-kiem)
export async function searchProducts(keyword) {
  const params = new URLSearchParams({ q: keyword });

  const res = await fetch(
    `${API_BASE}/api/products/search?` + params.toString()
  );

  if (!res.ok) {
    throw new Error("Lỗi gọi API search");
  }

  return res.json();
}

// ================== ADMIN STATS (THỐNG KÊ) ==================

function getAdminToken() {
  return localStorage.getItem("adminToken");
}

// Tổng quan: doanh thu, đơn hàng, khách, sản phẩm...
export async function fetchAdminOverview() {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/api/admin/stats/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Không tải được thống kê tổng quan.");
  }
  return res.json();
}

// Doanh thu theo ngày (dùng cho biểu đồ cột ngang)
export async function fetchAdminSalesByDate() {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/api/admin/stats/sales-by-date`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Không tải được doanh thu theo ngày.");
  }
  return res.json();
}

// Top sản phẩm bán chạy
export async function fetchAdminTopProducts(limit = 5) {
  const token = getAdminToken();
  const url = `${API_BASE}/api/admin/stats/top-products?limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Không tải được top sản phẩm.");
  }
  return res.json();
}

// Doanh thu theo danh mục
export async function fetchAdminTopCategories() {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/api/admin/stats/top-categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Không tải được doanh thu theo danh mục.");
  }
  return res.json();
}

// Sản phẩm sắp hết hàng (stock <= threshold)
export async function fetchAdminLowStock(threshold = 5) {
  const token = getAdminToken();
  const url = `${API_BASE}/api/admin/stats/low-stock?threshold=${threshold}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Không tải được sản phẩm sắp hết hàng.");
  }
  return res.json();
}
