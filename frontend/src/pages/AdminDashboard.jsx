// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminOverview,
  fetchAdminSalesByDate,
  fetchAdminTopProducts,
  fetchAdminTopCategories,
  fetchAdminLowStock,
} from "../api";
import { formatPrice } from "../utils";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [overview, setOverview] = useState(null);
  const [salesByDate, setSalesByDate] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [
          overviewData,
          salesData,
          topProdData,
          topCatData,
          lowStockData,
        ] = await Promise.all([
          fetchAdminOverview(),
          fetchAdminSalesByDate(),
          fetchAdminTopProducts(5),
          fetchAdminTopCategories(),
          fetchAdminLowStock(5),
        ]);

        setOverview(overviewData);
        setSalesByDate(salesData.list || []);
        setTopProducts(topProdData.list || []);
        setTopCategories(topCatData.list || []);
        setLowStock(lowStockData || []);
      } catch (err) {
        console.error("Lỗi tải thống kê admin:", err);
        setError(err.message || "Không tải được thống kê.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, navigate]);

  const dateLabel =
    overview && overview.dateRange
      ? `${overview.dateRange.from} → ${overview.dateRange.to}`
      : "";

  const maxRevenue =
    salesByDate.length > 0
      ? Math.max(...salesByDate.map((d) => Number(d.revenue) || 0))
      : 0;

  const maxCatRevenue =
    topCategories.length > 0
      ? Math.max(...topCategories.map((c) => Number(c.revenue) || 0))
      : 0;

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="admin-logo-main">MOBILE STORE</div>
          <div className="admin-logo-sub">ADMIN PANEL</div>
        </div>

        <nav className="admin-menu">

          <button
            className="admin-menu-item"
            onClick={() => navigate("/admin/san-pham")}
          >
            <i className="fas fa-box" /> Sản phẩm
          </button>

          <button
            className="admin-menu-item"
            onClick={() => navigate("/admin/danh-muc")}
          >
            <i className="fas fa-tags" /> Danh mục
          </button>

          <button
            className="admin-menu-item"
            onClick={() => navigate("/admin/don-hang")}
          >
            <i className="fas fa-receipt" /> Đơn hàng
          </button>

          <button
            className="admin-menu-item"
            onClick={() => navigate("/admin/tai-khoan")}
          >
            <i className="fas fa-users" /> Tài khoản
          </button>
                    <button
            className="admin-menu-item admin-menu-item-active"
            onClick={() => navigate("/admin/thong-ke")}
          >
            <i className="fas fa-chart-line" /> Thống kê
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <header className="admin-main-header">
          <div>
            <h1>Thống kê & Tổng quan</h1>
            <p>
              Doanh thu, đơn hàng, khách hàng và tồn kho trong khoảng gần đây.
            </p>
            {dateLabel && (
              <p className="admin-dashboard-daterange">
                Khoảng thống kê: <strong>{dateLabel}</strong>
              </p>
            )}
          </div>
        </header>

        {error && (
          <div className="admin-alert admin-alert-error">{error}</div>
        )}

        {loading || !overview ? (
          <section className="admin-card">
            <p>Đang tải thống kê...</p>
          </section>
        ) : (
          <>
            {/* ====== HÀNG THẺ TỔNG QUAN ====== */}
            <section className="admin-dashboard-grid">
              <div className="admin-stat-card admin-stat-card-primary">
                <div className="admin-stat-label">Doanh thu (khoảng gần đây)</div>
                <div className="admin-stat-value">
                  {formatPrice(overview.ordersInRange.totalRevenueInRange || 0)}
                </div>
                <div className="admin-stat-sub">
                  {overview.ordersInRange.totalOrdersInRange || 0} đơn hoàn tất
                </div>
              </div>

              <div className="admin-stat-card admin-stat-card-green">
                <div className="admin-stat-label">Doanh thu (từ trước tới nay)</div>
                <div className="admin-stat-value">
                  {formatPrice(overview.ordersAllTime.totalRevenueAllTime || 0)}
                </div>
                <div className="admin-stat-sub">
                  {overview.ordersAllTime.totalOrdersAllTime || 0} đơn PAID/COMPLETED
                </div>
              </div>

              <div className="admin-stat-card admin-stat-card-orange">
                <div className="admin-stat-label">Hôm nay</div>
                <div className="admin-stat-value">
                  {formatPrice(overview.today.todayRevenue || 0)}
                </div>
                <div className="admin-stat-sub">
                  {overview.today.todayOrders || 0} đơn hoàn tất hôm nay
                </div>
              </div>

              <div className="admin-stat-card admin-stat-card-blue">
                <div className="admin-stat-label">Khách hàng & Sản phẩm</div>
                <div className="admin-stat-value">
                  {overview.users.totalCustomers || 0} KH
                </div>
                <div className="admin-stat-sub">
                  {overview.products.totalActiveProducts || 0} sản phẩm đang bán
                </div>
              </div>
            </section>

            {/* ====== BIỂU ĐỒ DOANH THU THEO NGÀY + DOANH THU THEO DANH MỤC ====== */}
            <section className="admin-dashboard-charts">
              <div className="admin-card admin-chart-card">
                <h2>Doanh thu theo ngày</h2>
                {salesByDate.length === 0 ? (
                  <p>Chưa có đơn hàng trong khoảng này.</p>
                ) : (
                  <div className="chart-vertical-list">
                    {salesByDate.map((d) => {
                      const revenue = Number(d.revenue) || 0;
                      const width =
                        maxRevenue > 0
                          ? Math.max(8, (revenue / maxRevenue) * 100)
                          : 0;
                      return (
                        <div key={d.date} className="chart-row">
                          <div className="chart-label">{d.date}</div>
                          <div className="chart-bar-wrap">
                            <div
                              className="chart-bar"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                          <div className="chart-value">
                            {formatPrice(revenue)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="admin-card admin-chart-card">
                <h2>Doanh thu theo danh mục</h2>
                {topCategories.length === 0 ? (
                  <p>Chưa có dữ liệu danh mục.</p>
                ) : (
                  <div className="chart-vertical-list">
                    {topCategories.map((c) => {
                      const revenue = Number(c.revenue) || 0;
                      const width =
                        maxCatRevenue > 0
                          ? Math.max(8, (revenue / maxCatRevenue) * 100)
                          : 0;
                      return (
                        <div key={c.category_id} className="chart-row">
                          <div className="chart-label">{c.category_name}</div>
                          <div className="chart-bar-wrap">
                            <div
                              className="chart-bar chart-bar-secondary"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                          <div className="chart-value">
                            {formatPrice(revenue)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* ====== TOP SẢN PHẨM + HÀNG SẮP HẾT ====== */}
            <section className="admin-dashboard-bottom">
              <div className="admin-card admin-table-card">
                <div className="admin-card-header">
                  <h2>Top sản phẩm bán chạy</h2>
                  <span className="admin-card-sub">
                    Theo số lượng bán ra trong khoảng gần đây
                  </span>
                </div>
                {topProducts.length === 0 ? (
                  <p>Chưa có dữ liệu.</p>
                ) : (
                  <table className="admin-table admin-table-compact">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, idx) => (
                        <tr key={p.product_id}>
                          <td>{idx + 1}</td>
                          <td>{p.product_name}</td>
                          <td>{p.quantity}</td>
                          <td>{formatPrice(p.revenue || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="admin-card admin-table-card">
                <div className="admin-card-header">
                  <h2>Sản phẩm sắp hết hàng</h2>
                  <span className="admin-card-sub">
                    Gợi ý nhập thêm kho (stock &le; 5)
                  </span>
                </div>
                {lowStock.length === 0 ? (
                  <p>Hiện chưa có sản phẩm nào sắp hết hàng.</p>
                ) : (
                  <table className="admin-table admin-table-compact">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Tồn kho</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStock.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.category_name || "-"}</td>
                          <td>{p.stock}</td>
                          <td>
                            <span
                              className={
                                p.is_active
                                  ? "admin-status admin-status-active"
                                  : "admin-status admin-status-inactive"
                              }
                            >
                              {p.is_active ? "Đang bán" : "Ẩn"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
