// src/utils.js
export const formatPrice = (n) =>
  n
    .toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    .replace("₫", "đ");
