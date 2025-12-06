"use client"; // Bắt buộc: Đây là tính năng tương tác

import React, { createContext, useContext, useState, useEffect } from "react";

// Định nghĩa cấu trúc món hàng trong giỏ
type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Hồi phục giỏ hàng từ bộ nhớ máy tính (nếu khách lỡ F5)
  useEffect(() => {
    const savedCart = localStorage.getItem("pharmaCart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Lưu giỏ hàng mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem("pharmaCart", JSON.stringify(cart));
  }, [cart]);

  // Hàm thêm hàng
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        // Nếu có rồi thì tăng số lượng
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Nếu chưa có thì thêm mới
      return [...prev, { ...product, quantity: 1 }];
    });
    alert(`Đã thêm "${product.name}" vào giỏ!`); // Thông báo nhỏ
  };

  // Hàm xóa hàng
  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Tính tổng số lượng
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hàm để các trang khác gọi giỏ hàng ra dùng
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
