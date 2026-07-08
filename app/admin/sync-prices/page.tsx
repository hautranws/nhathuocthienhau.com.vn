"use client";
import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- TYPES ---
interface ProductDB {
  id: number;
  sku: string;
  title: string;
  price: number;
  category: string;
}

interface PreviewRow {
  sku: string;
  currentPrice: number | null;
  newPrice: number;
  status: "ready" | "not_found" | "error";
  message: string;
  productTitle?: string;
}

interface MissingProduct extends ProductDB {
  matchedSkuCount?: number;
}

export default function SyncPricesPage() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [missingProducts, setMissingProducts] = useState<MissingProduct[]>([]);
  const [showMissingProducts, setShowMissingProducts] = useState(false);
  const [findingMissing, setFindingMissing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // --- 1. HÀM XUẤT DỮ LIỆU HIỆN TẠI (EXPORT EXCEL) ---
  const handleExportData = async () => {
    setExportLoading(true);
    try {
      let allProducts: ProductDB[] = [];
      let hasMore = true;
      let page = 0;
      const limit = 1000;

      // Lấy toàn bộ dữ liệu (Phân trang phòng trường hợp DB quá lớn)
      while (hasMore) {
        const { data, error } = await supabase
          .from("products")
          .select("id, sku, title, price, category")
          .range(page * limit, (page + 1) * limit - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allProducts = [...allProducts, ...(data as ProductDB[])];
          page++;
        } else {
          hasMore = false;
        }
      }

      if (allProducts.length === 0) {
        alert("Không có dữ liệu sản phẩm để xuất.");
        return;
      }

      // Map data ra format Excel
      const exportData = allProducts.map((p) => ({
        "ID DB": p.id,
        "Mã SKU": p.sku || "",
        "Tên sản phẩm": p.title,
        "Danh mục": p.category,
        "Giá hiện tại trên Web": p.price || 0,
      }));

      // Tạo file Excel
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bang_Gia_Web");

      // Lấy ngày YYYYMMDD
      const dateObj = new Date();
      const dateStr = `${dateObj.getFullYear()}${(dateObj.getMonth() + 1).toString().padStart(2, "0")}${dateObj.getDate().toString().padStart(2, "0")}`;

      XLSX.writeFile(workbook, `Bang_Gia_Web_${dateStr}.xlsx`);
    } catch (error: any) {
      console.error("Lỗi xuất dữ liệu:", error);
      alert("Lỗi xuất dữ liệu: " + error.message);
    } finally {
      setExportLoading(false);
    }
  };

  // --- 2. HÀM XỬ LÝ UPLOAD VÀ ĐỌC FILE (IMPORT EXCEL) ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setPreviewData([]);

    try {
      const file = files[0];
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        alert("File Excel trống hoặc không đúng định dạng!");
        setLoading(false);
        return;
      }

      // Bước 1: Chuẩn hóa và lọc dữ liệu từ Excel
      const parsedRows = jsonData
        .map((row, index) => {
          const sku = (row["Mã SKU"] || row["SKU"] || row["sku"] || "")
            .toString()
            .trim();

          // Ưu tiên cột "wed", nếu không có lấy "Giá bán lẻ", "Giá" hoặc "Price"
          let rawPrice =
            row["wed"] !== undefined && row["wed"] !== ""
              ? row["wed"]
              : row["Giá bán lẻ"] || row["Giá"] || row["price"] || row["Price"];

          // Dọn dẹp dấu phẩy, khoảng trắng để parse số
          if (typeof rawPrice === "string") {
            rawPrice = rawPrice.replace(/,/g, "").replace(/\./g, "").trim();
          }
          const newPrice = parseInt(rawPrice, 10);

          return { sku, newPrice, originalRow: index + 2 };
        })
        .filter((r) => r.sku && !isNaN(r.newPrice)); // Chỉ lấy các dòng có SKU và parse giá thành công

      if (parsedRows.length === 0) {
        alert(
          "Không tìm thấy dữ liệu hợp lệ (Thiếu cột 'Mã SKU' hoặc cột giá không đúng). Vui lòng kiểm tra lại file Sapo.",
        );
        setLoading(false);
        return;
      }

      // Bước 2: Fetch dữ liệu từ Supabase để đối chiếu (Tìm xem SKU có tồn tại không)
      // Chia nhỏ mảng SKUs để fetch (tránh lỗi URL too long nếu query mảng quá bự)
      const uniqueSkus = Array.from(new Set(parsedRows.map((r) => r.sku)));
      let dbProducts: ProductDB[] = [];

      const chunkSize = 150;
      for (let i = 0; i < uniqueSkus.length; i += chunkSize) {
        const chunk = uniqueSkus.slice(i, i + chunkSize);
        const { data: chunkData, error } = await supabase
          .from("products")
          .select("id, sku, title, price, category")
          .in("sku", chunk);

        if (error) throw error;
        if (chunkData)
          dbProducts = [...dbProducts, ...(chunkData as ProductDB[])];
      }

      // Bước 3: Tạo mảng Preview ghép giữa Excel và DB
      const preview: PreviewRow[] = parsedRows.map((row) => {
        // Tìm sản phẩm trùng khớp SKU
        const matchedProduct = dbProducts.find((p) => p.sku === row.sku);

        if (matchedProduct) {
          return {
            sku: row.sku,
            currentPrice: matchedProduct.price,
            newPrice: row.newPrice,
            status: "ready",
            message: "Sẵn sàng cập nhật",
            productTitle: matchedProduct.title,
          };
        } else {
          return {
            sku: row.sku,
            currentPrice: null,
            newPrice: row.newPrice,
            status: "not_found",
            message: "Không tìm thấy trên Web",
          };
        }
      });

      setPreviewData(preview);
    } catch (error: any) {
      console.error("Lỗi đọc file:", error);
      alert("Đã xảy ra lỗi khi đọc file Excel: " + error.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  // --- 3. HÀM ĐỒNG BỘ DỮ LIỆU LÊN SUPABASE ---
  const handleSyncPrices = async () => {
    const rowsToSync = previewData.filter((r) => r.status === "ready");

    if (rowsToSync.length === 0) {
      alert("Không có sản phẩm nào hợp lệ để đồng bộ.");
      return;
    }

    if (
      !confirm(
        `Bạn có chắc muốn đồng bộ giá cho ${rowsToSync.length} sản phẩm? Thao tác này không thể hoàn tác.`,
      )
    ) {
      return;
    }

    setSyncing(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Giảm BATCH_SIZE xuống 10 để tránh cạn kiệt Connection Pool của Supabase
      const BATCH_SIZE = 10;
      for (let i = 0; i < rowsToSync.length; i += BATCH_SIZE) {
        const batch = rowsToSync.slice(i, i + BATCH_SIZE);

        // Dùng Promise.all để update song song trong cùng 1 lô (batch)
        await Promise.all(
          batch.map(async (row) => {
            // Query update: WHERE sku = row.sku
            const { error } = await supabase
              .from("products")
              .update({ price: row.newPrice })
              .eq("sku", row.sku);

            if (error) {
              console.error(`Lỗi update SKU ${row.sku}:`, error);
              failCount++;
            } else {
              successCount++;
            }
          }),
        );

        // Thêm delay 100ms giữa các batch để DB xả tải và giải phóng connection
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      alert(
        `✅ Đồng bộ hoàn tất!\n- Thành công: ${successCount}\n- Thất bại: ${failCount}`,
      );
      setPreviewData([]); // Clear bảng sau khi update xong
    } catch (error: any) {
      alert("Lỗi nghiêm trọng khi đồng bộ: " + error.message);
    } finally {
      setSyncing(false);
    }
  };

  // --- 4. HÀM TÌM NHỮNG SẢN PHẨM KHÔNG CÓ TRONG FILE EXCEL ---
  const handleFindMissingProducts = async () => {
    if (previewData.length === 0) {
      alert("Vui lòng nhập file Excel trước!");
      return;
    }

    setFindingMissing(true);
    try {
      // Bước 1: Lấy tất cả SKU có trong file
      const skuInFile = new Set(previewData.map((r) => r.sku));

      // Bước 2: Lấy tất cả sản phẩm từ database
      let allProducts: ProductDB[] = [];
      let hasMore = true;
      let page = 0;
      const limit = 1000;

      while (hasMore) {
        const { data, error } = await supabase
          .from("products")
          .select("id, sku, title, price, category")
          .range(page * limit, (page + 1) * limit - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allProducts = [...allProducts, ...(data as ProductDB[])];
          page++;
        } else {
          hasMore = false;
        }
      }

      // Bước 3: Lọc những sản phẩm không có SKU trong file
      const missing = allProducts.filter((p) => !skuInFile.has(p.sku));

      setMissingProducts(missing);
      setShowMissingProducts(true);

      alert(`Tìm thấy ${missing.length} sản phẩm không có trong file Excel!`);
    } catch (error: any) {
      console.error("Lỗi tìm sản phẩm thiếu:", error);
      alert("Lỗi: " + error.message);
    } finally {
      setFindingMissing(false);
    }
  };

  // --- SUMMARY STATS ---
  const readyCount = previewData.filter((r) => r.status === "ready").length;
  const notFoundCount = previewData.filter(
    (r) => r.status === "not_found",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* BREADCRUMB & TITLE */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <Link
              href="/admin"
              className="text-sm text-blue-600 hover:underline mb-2 inline-block"
            >
              ← Quay lại Quản trị
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🔄 Đồng Bộ Giá Hàng Loạt (Sapo)
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Cập nhật giá website tự động từ file xuất của hệ thống Sapo.
            </p>
          </div>

          {/* NÚT XUẤT EXCEL */}
          <button
            onClick={handleExportData}
            disabled={exportLoading}
            className={`px-5 py-2.5 rounded-lg font-bold shadow-sm transition flex items-center gap-2 ${
              exportLoading
                ? "bg-gray-300 text-gray-600"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {exportLoading ? "⏳ Đang xuất..." : "📥 Xuất giá Web hiện tại"}
          </button>
        </div>

        {/* KHU VỰC IMPORT */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-4">
            1. Tải lên file Excel từ Sapo
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-4 bg-blue-50 p-6 rounded-xl border border-dashed border-blue-300">
            <div className="flex-1">
              <p className="font-semibold text-blue-800 mb-1">
                Quy định file tải lên:
              </p>
              <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
                <li>
                  Phải có cột <strong>"Mã SKU"</strong> để nhận diện sản phẩm.
                </li>
                <li>
                  Cột giá (Ưu tiên đọc theo thứ tự): <strong>"wed"</strong>,{" "}
                  <strong>"Giá bán lẻ"</strong>, <strong>"Giá"</strong> hoặc{" "}
                  <strong>"Price"</strong>.
                </li>
              </ul>
            </div>
            <div className="flex-none">
              <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition inline-block text-center"
              >
                {loading ? "⏳ Đang đọc file..." : "📁 Chọn file Excel (Sapo)"}
              </label>
            </div>
          </div>
        </div>

        {/* KHU VỰC PREVIEW */}
        {previewData.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">2. Bảng xem trước dữ liệu</h2>
              <div className="flex gap-4 text-sm font-medium">
                <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  ✅ Sẵn sàng cập nhật: {readyCount}
                </span>
                <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  ⚠️ Không tìm thấy SKU: {notFoundCount}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px] border border-gray-200 rounded-lg shadow-inner">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-gray-100 text-gray-700 uppercase font-bold sticky top-0 z-10">
                  <tr>
                    <th className="p-3 border-b">STT</th>
                    <th className="p-3 border-b">Mã SKU</th>
                    <th className="p-3 border-b min-w-[200px]">Sản phẩm</th>
                    <th className="p-3 border-b text-right">Giá Web (Cũ)</th>
                    <th className="p-3 border-b text-right">Giá Sapo (Mới)</th>
                    <th className="p-3 border-b text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewData.map((row, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 ${row.status === "not_found" ? "bg-red-50" : ""}`}
                    >
                      <td className="p-3 text-gray-500 font-mono">
                        {index + 1}
                      </td>
                      <td className="p-3 font-bold text-gray-800">{row.sku}</td>
                      <td className="p-3">
                        <div
                          className="font-semibold text-blue-700 line-clamp-1"
                          title={row.productTitle}
                        >
                          {row.productTitle || "---"}
                        </div>
                      </td>
                      <td className="p-3 text-right text-gray-500 line-through">
                        {row.currentPrice
                          ? row.currentPrice.toLocaleString("vi-VN")
                          : "---"}
                      </td>
                      <td className="p-3 text-right font-bold text-red-600 text-base">
                        {row.newPrice.toLocaleString("vi-VN")}
                      </td>
                      <td className="p-3 text-center">
                        {row.status === "ready" ? (
                          <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">
                            Hợp lệ
                          </span>
                        ) : (
                          <span
                            className="text-red-600 text-xs font-bold bg-red-100 px-2 py-1 rounded"
                            title={row.message}
                          >
                            Lỗi SKU
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* NÚT ACTION ĐỒNG BỘ */}
            <div className="mt-6 flex justify-end gap-4 border-t pt-6">
              <button
                onClick={() => setPreviewData([])}
                disabled={syncing}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleFindMissingProducts}
                disabled={findingMissing || syncing}
                className={`px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2 ${
                  findingMissing || syncing
                    ? "bg-yellow-300 cursor-not-allowed text-gray-700"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                }`}
              >
                {findingMissing ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    Đang tìm...
                  </>
                ) : (
                  "🔍 Tìm SP chưa cập nhật giá"
                )}
              </button>
              <button
                onClick={handleSyncPrices}
                disabled={syncing || readyCount === 0}
                className={`px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2 ${
                  syncing || readyCount === 0
                    ? "bg-blue-300 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {syncing ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    Đang đồng bộ...
                  </>
                ) : (
                  `🚀 Xác nhận đồng bộ (${readyCount} SP)`
                )}
              </button>
            </div>
          </div>
        )}

        {/* SECTION HIỂN THỊ SẢN PHẨM KHÔNG CÓ TRONG FILE */}
        {showMissingProducts && missingProducts.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-300 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-yellow-700">
                ⚠️ Danh sách sản phẩm chưa được cập nhật giá (
                {missingProducts.length})
              </h2>
              <button
                onClick={() => setShowMissingProducts(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto max-h-[500px] border border-yellow-200 rounded-lg shadow-inner">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-yellow-100 text-yellow-800 uppercase font-bold sticky top-0 z-10">
                  <tr>
                    <th className="p-3 border-b">STT</th>
                    <th className="p-3 border-b">Mã SKU</th>
                    <th className="p-3 border-b min-w-[250px]">Tên sản phẩm</th>
                    <th className="p-3 border-b">Danh mục</th>
                    <th className="p-3 border-b text-right">Giá hiện tại</th>
                    <th className="p-3 border-b text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-100">
                  {missingProducts.map((product, index) => (
                    <tr key={product.id} className="hover:bg-yellow-50">
                      <td className="p-3 text-gray-500 font-mono">
                        {index + 1}
                      </td>
                      <td className="p-3 font-bold text-yellow-700">
                        {product.sku}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-gray-800 line-clamp-2">
                          {product.title}
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{product.category}</td>
                      <td className="p-3 text-right font-bold text-gray-800">
                        {product.price?.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                          className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition"
                        >
                          ✏️ Sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-yellow-700">
                💡 <strong>Ghi chú:</strong> Những sản phẩm này có trong
                database nhưng không xuất hiện trong file Excel được cập nhật.
                Bạn có thể xuất file này để bổ sung giá hoặc kiểm tra lại dữ
                liệu.
              </p>
            </div>
          </div>
        )}

        {/* TRƯỜNG HỢP TÌM KHÔNG CÓ SẢN PHẨM THIẾU */}
        {showMissingProducts && missingProducts.length === 0 && (
          <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-300 animate-fadeIn">
            <p className="text-green-700 text-center font-semibold">
              ✅ Tuyệt vời! Tất cả sản phẩm đều có trong file Excel cần cập nhật
              giá.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
