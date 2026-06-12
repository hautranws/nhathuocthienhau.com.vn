"use client";
import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";
import Link from "next/link";

// --- TYPES ---
interface ProductDB {
  id: number;
  sku: string;
  variant: string | null;
  title: string;
  price: number;
  category: string;
}

interface PreviewRow {
  sku: string;
  variant: string;
  currentPrice: number | null;
  newPrice: number;
  status: "ready" | "not_found" | "error";
  message: string;
  productTitle?: string;
}

export default function SyncPricesPage() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
          .select("id, sku, variant, title, price, category")
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
        "Tên phiên bản sản phẩm": p.variant || "",
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
          const variant = (
            row["Tên phiên bản sản phẩm"] ||
            row["Phiên bản"] ||
            row["Variant"] ||
            ""
          )
            .toString()
            .trim();

          // Ưu tiên cột "wed", nếu không có lấy "Giá bán lẻ"
          let rawPrice =
            row["wed"] !== undefined && row["wed"] !== ""
              ? row["wed"]
              : row["Giá bán lẻ"];

          // Dọn dẹp dấu phẩy, khoảng trắng để parse số
          if (typeof rawPrice === "string") {
            rawPrice = rawPrice.replace(/,/g, "").replace(/\./g, "").trim();
          }
          const newPrice = parseInt(rawPrice, 10);

          return { sku, variant, newPrice, originalRow: index + 2 };
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
          .select("id, sku, variant, title, price, category")
          .in("sku", chunk);

        if (error) throw error;
        if (chunkData) dbProducts = [...dbProducts, ...(chunkData as ProductDB[])];
      }

      // Bước 3: Tạo mảng Preview ghép giữa Excel và DB
      const preview: PreviewRow[] = parsedRows.map((row) => {
        // Tìm sản phẩm trùng khớp cả SKU và Variant (nếu có variant)
        const matchedProduct = dbProducts.find(
          (p) => p.sku === row.sku && (p.variant || "") === row.variant,
        );

        if (matchedProduct) {
          return {
            sku: row.sku,
            variant: row.variant,
            currentPrice: matchedProduct.price,
            newPrice: row.newPrice,
            status: "ready",
            message: "Sẵn sàng cập nhật",
            productTitle: matchedProduct.title,
          };
        } else {
          return {
            sku: row.sku,
            variant: row.variant,
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
            // Query update: WHERE sku = row.sku AND (variant = row.variant OR (variant IS NULL nếu row.variant = ""))
            let query = supabase
              .from("products")
              .update({ price: row.newPrice })
              .eq("sku", row.sku);

            if (row.variant) {
              query = query.eq("variant", row.variant);
            } else {
              query = query.is("variant", null); // Hoặc eq('variant', '') tùy schema của bạn
            }

            const { error } = await query;

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
                  Có cột <strong>"Tên phiên bản sản phẩm"</strong> (nếu có phân
                  loại).
                </li>
                <li>
                  Cột giá ưu tiên: <strong>"wed"</strong>. Nếu trống sẽ lấy{" "}
                  <strong>"Giá bán lẻ"</strong>.
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
                    <th className="p-3 border-b min-w-[200px]">
                      Sản phẩm / Phân loại
                    </th>
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
                        {row.variant && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block">
                            Phân loại: {row.variant}
                          </span>
                        )}
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
      </div>
    </div>
  );
}
