"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// Định nghĩa kiểu dữ liệu
type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  img: string;
  name?: string;
  image_url?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, newQuantity: number) => void; // <--- MỚI: Hàm chỉnh số lượng
  totalItems: number;
  totalPrice: number;
  cartHighlight: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [cartHighlight, setCartHighlight] = useState(false);

  // 1. Hồi phục giỏ hàng
  useEffect(() => {
    const savedCart = localStorage.getItem("pharmaCart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Lỗi đọc giỏ hàng cũ", e);
      }
    }
  }, []);

  // 2. Lưu giỏ hàng
  useEffect(() => {
    localStorage.setItem("pharmaCart", JSON.stringify(cart));
  }, [cart]);

  // Helper: Lấy link ảnh sạch
  const getCleanImage = (imgData: string) => {
    try {
      const parsed = JSON.parse(imgData);
      return Array.isArray(parsed) ? parsed[0] : imgData;
    } catch {
      return imgData;
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);

    window.clearTimeout((window as any).__cartToastTimer);
    (window as any).__cartToastTimer = window.setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  };

  // Hàm thêm vào giỏ
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title || product.name || "Sản phẩm", // Lấy đúng tên
          price: Number(product.price),
          img: getCleanImage(product.img || product.image_url),
          quantity: 1,
        },
      ];
    });
    showToast("Đã thêm vào giỏ hàng");

    setCartHighlight(true);
    window.clearTimeout((window as any).__cartHighlightTimer);
    (window as any).__cartHighlightTimer = window.setTimeout(() => {
      setCartHighlight(false);
    }, 1200);
  };

  // --- MỚI: Hàm cập nhật số lượng ---
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return; // Không cho giảm dưới 1
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalItems,
        totalPrice,
        cartHighlight,
      }}
    >
      {children}

      <div
        className={`pointer-events-none fixed bottom-4 left-1/2 z-[9999] w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 transition-all duration-300 md:bottom-6 md:left-auto md:right-6 md:translate-x-0 ${
          toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="pointer-events-auto rounded-2xl border border-emerald-200 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur px-4 py-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-lg shrink-0">
            ✓
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">
              {toastMessage || "Đã thêm vào giỏ hàng"}
            </p>
            <p className="text-xs text-slate-500">
              Mở giỏ hàng để xem và thanh toán.
            </p>
          </div>
        </div>
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
