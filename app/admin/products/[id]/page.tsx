"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Đảm bảo đường dẫn đúng
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id; // Lấy ID từ URL

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // State lưu thông tin sản phẩm
  const [product, setProduct] = useState({
    title: "",
    price: 0,
    old_price: 0,
    img: "",
    category_id: "",
    description: "",
  });

  useEffect(() => {
    if (id) {
      fetchProductDetail();
    }
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        // Xử lý ảnh: Nếu ảnh là chuỗi JSON mảng ["url"], lấy cái đầu tiên để hiển thị trong ô input text
        let imgUrl = data.img;
        if (data.img && data.img.startsWith("[")) {
            try {
                const parsed = JSON.parse(data.img);
                if (Array.isArray(parsed)) imgUrl = parsed[0];
            } catch (e) {}
        }

        setProduct({
          title: data.title || "",
          price: data.price || 0,
          old_price: data.old_price || 0,
          img: imgUrl || "",
          category_id: data.category_id || "",
          description: data.description || "",
        });
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không tìm thấy sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Cập nhật lại vào Supabase
      const { error } = await supabase
        .from("products")
        .update({
          title: product.title,
          price: Number(product.price),
          old_price: Number(product.old_price),
          img: product.img, // Lưu ý: Ở đây đang lưu chuỗi link ảnh đơn giản
          category_id: product.category_id,
          description: product.description,
        })
        .eq("id", id);

      if (error) throw error;

      alert("Cập nhật thành công! 🎉");
      router.push("/admin/activity"); // Quay lại trang nhật ký
    } catch (error: any) {
      alert("Lỗi cập nhật: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Đang tải thông tin sản phẩm...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h1 className="text-white text-xl font-bold">✏️ Chỉnh Sửa Sản Phẩm</h1>
          <Link href="/admin/activity" className="text-blue-100 hover:text-white text-sm">
             Quay lại
          </Link>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-4 text-gray-700">
          {/* Tên sản phẩm */}
          <div>
            <label className="block text-sm font-bold mb-1">Tên sản phẩm</label>
            <input
              type="text"
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-300 outline-none"
              value={product.title}
              onChange={(e) => setProduct({ ...product, title: e.target.value })}
              required
            />
          </div>

          {/* Giá & Giá cũ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-red-600">Giá bán (VNĐ)</label>
              <input
                type="number"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-300 outline-none"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-500">Giá cũ (nếu có)</label>
              <input
                type="number"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-300 outline-none"
                value={product.old_price}
                onChange={(e) => setProduct({ ...product, old_price: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Link ảnh */}
          <div>
            <label className="block text-sm font-bold mb-1">Link Ảnh (URL)</label>
            <input
              type="text"
              placeholder="https://..."
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-300 outline-none"
              value={product.img}
              onChange={(e) => setProduct({ ...product, img: e.target.value })}
            />
            {product.img && (
              <img src={product.img} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded border" />
            )}
          </div>

          {/* Danh mục */}
          <div>
            <label className="block text-sm font-bold mb-1">Mã Danh Mục (Category ID)</label>
            <input
              type="text"
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-300 outline-none"
              value={product.category_id}
              onChange={(e) => setProduct({ ...product, category_id: e.target.value })}
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-bold mb-1">Mô tả chi tiết</label>
            <textarea
              rows={4}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-300 outline-none"
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
            />
          </div>

          {/* Nút lưu */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={updating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition w-full disabled:bg-gray-400"
            >
              {updating ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
            <Link
                href="/admin/activity"
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition text-center"
            >
                Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}