"use client";
import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";
import Link from "next/link";
import { formatPrice, parsePrice } from "@/lib/format-price";

// --- TYPES ---
interface ProductDB {
  id: number;
  sku: string;
  title: string;
  price: number;
  category: string;
  quantity?: number | null;
  is_out_of_stock?: boolean;
}

interface PreviewRow {
  sku: string;
  fileTitle: string;
  productId?: number;
  currentPrice: number | null;
  newPrice: number;
  percentChange: number | null;
  status: "changed" | "unchanged" | "not_found" | "error";
  message: string;
  productTitle?: string;
}

interface MissingProduct extends ProductDB {
  matchedSkuCount?: number;
}

type AvailabilityChoice = "in_stock" | "out_of_stock";

export default function SyncPricesPage() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [missingProducts, setMissingProducts] = useState<MissingProduct[]>([]);
  const [showMissingProducts, setShowMissingProducts] = useState(false);
  const [findingMissing, setFindingMissing] = useState(false);
  const [showFileOnly, setShowFileOnly] = useState(false);
  const [showChangedOnly, setShowChangedOnly] = useState(false);
  const [percentSort, setPercentSort] = useState<"asc" | "desc" | null>(null);
  const [editingSku, setEditingSku] = useState<Record<number, string>>({});
  const [savingSkuId, setSavingSkuId] = useState<number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [availabilityChoices, setAvailabilityChoices] = useState<
    Record<number, AvailabilityChoice | undefined>
  >({});
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [outOfStockProducts, setOutOfStockProducts] = useState<ProductDB[]>([]);
  const [loadingOutOfStock, setLoadingOutOfStock] = useState(false);
  const [restoringProductId, setRestoringProductId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Mã SKU", "Tên sản phẩm", "wed"],
      ["SP-001", "Tên sản phẩm mẫu 1", 125000],
      ["SP-002", "Tên sản phẩm mẫu 2", 89000],
    ]);
    worksheet["A2"].t = "s";
    worksheet["A3"].t = "s";
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bang_Gia_Sapo");
    XLSX.writeFile(workbook, "Mau_dong_bo_gia_Sapo.xlsx");
  };

  const downloadExcel = (rows: Record<string, string | number>[], fileName: string) => {
    if (!rows.length) {
      alert("Không có dữ liệu để xuất.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kiem_Tra");
    XLSX.writeFile(workbook, fileName);
  };

  const handleExportFileOnly = () => {
    downloadExcel(
      previewData
        .filter((row) => row.status === "not_found")
        .map((row) => ({
          "Mã SKU": row.sku,
          "Tên trong file": row.fileTitle,
          "Giá trong file": row.newPrice,
          "Trạng thái": "File có, website không có",
        })),
      "San_pham_file_co_web_khong_co.xlsx",
    );
  };

  const handleExportWebOnly = () => {
    downloadExcel(
      missingProducts.map((product) => ({
        "ID DB": product.id,
        "Mã SKU": product.sku || "",
        "Tên sản phẩm trên web": product.title,
        "Danh mục": product.category || "",
        "Giá hiện tại trên web": product.price || 0,
        "Trạng thái": "Website có, file không có",
      })),
      "San_pham_web_co_file_khong_co.xlsx",
    );
  };

  const handleSkuChange = (id: number, value: string) => {
    setEditingSku((current) => ({ ...current, [id]: value }));
  };

  const handleSaveSku = async (product: MissingProduct) => {
    const nextSku = (editingSku[product.id] ?? product.sku ?? "").trim();
    if (!nextSku) {
      alert("Vui lòng nhập mã SKU hợp lệ.");
      return;
    }

    if (nextSku === (product.sku ?? "").trim()) {
      alert("SKU chưa được thay đổi.");
      return;
    }

    setSavingSkuId(product.id);
    try {
      const { data: duplicate, error: duplicateError } = await supabase
        .from("products")
        .select("id")
        .eq("sku", nextSku)
        .neq("id", product.id)
        .maybeSingle();

      if (duplicateError) throw duplicateError;
      if (duplicate) {
        alert(`SKU ${nextSku} đã được sử dụng cho sản phẩm khác.`);
        return;
      }

      const { error } = await supabase
        .from("products")
        .update({ sku: nextSku })
        .eq("id", product.id);

      if (error) throw error;

      setMissingProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, sku: nextSku } : item,
        ),
      );
      setEditingSku((current) => ({ ...current, [product.id]: nextSku }));
      alert("Đã cập nhật SKU thành công.");
    } catch (error: unknown) {
      alert(
        `Không thể cập nhật SKU: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
      );
    } finally {
      setSavingSkuId(null);
    }
  };

  const handleDeleteProduct = async (product: MissingProduct) => {
    if (
      !confirm(
        `Bạn có chắc muốn xóa sản phẩm "${product.title}"? Thao tác này không thể hoàn tác.`,
      )
    ) {
      return;
    }

    setDeletingProductId(product.id);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;

      setMissingProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
      setAvailabilityChoices((current) => {
        const next = { ...current };
        delete next[product.id];
        return next;
      });
      setEditingSku((current) => {
        const next = { ...current };
        delete next[product.id];
        return next;
      });
      alert("Đã xóa sản phẩm thành công.");
    } catch (error: unknown) {
      alert(
        `Không thể xóa sản phẩm: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
      );
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleSavePreviewSku = async (row: PreviewRow) => {
    if (!row.productId) return;

    const nextSku = (editingSku[row.productId] ?? row.sku).trim();
    if (!nextSku) {
      alert("Vui lòng nhập mã SKU hợp lệ.");
      return;
    }

    if (nextSku === row.sku.trim()) {
      alert("SKU chưa được thay đổi.");
      return;
    }

    setSavingSkuId(row.productId);
    try {
      const { data: duplicate, error: duplicateError } = await supabase
        .from("products")
        .select("id")
        .eq("sku", nextSku)
        .neq("id", row.productId)
        .maybeSingle();

      if (duplicateError) throw duplicateError;
      if (duplicate) {
        alert(`SKU ${nextSku} đã được sử dụng cho sản phẩm khác.`);
        return;
      }

      const { error } = await supabase
        .from("products")
        .update({ sku: nextSku })
        .eq("id", row.productId);

      if (error) throw error;

      setPreviewData((current) =>
        current.map((item) =>
          item.productId === row.productId ? { ...item, sku: nextSku } : item,
        ),
      );
      setEditingSku((current) => ({ ...current, [row.productId as number]: nextSku }));
      alert("Đã cập nhật SKU thành công.");
    } catch (error: unknown) {
      alert(
        `Không thể cập nhật SKU: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
      );
    } finally {
      setSavingSkuId(null);
    }
  };

  const handleDeletePreviewProduct = async (row: PreviewRow) => {
    if (!row.productId) return;

    if (
      !confirm(
        `Bạn có chắc muốn xóa sản phẩm "${row.productTitle || row.sku}"? Thao tác này không thể hoàn tác.`,
      )
    ) {
      return;
    }

    setDeletingProductId(row.productId);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", row.productId);

      if (error) throw error;

      setPreviewData((current) =>
        current.filter((item) => item.productId !== row.productId),
      );
      setEditingSku((current) => {
        const next = { ...current };
        delete next[row.productId as number];
        return next;
      });
      alert("Đã xóa sản phẩm thành công.");
    } catch (error: unknown) {
      alert(
        `Không thể xóa sản phẩm: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
      );
    } finally {
      setDeletingProductId(null);
    }
  };

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
    } catch (error: unknown) {
      console.error("Lỗi xuất dữ liệu:", error);
      alert("Lỗi xuất dữ liệu: " + (error instanceof Error ? error.message : "Lỗi không xác định"));
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
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

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
          const fileTitle = (
            row["Tên sản phẩm"] ||
            row["Tên sản phẩm Sapo"] ||
            row["Tên"] ||
            row["Product name"] ||
            row["title"] ||
            ""
          )
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
          const newPrice = parseInt(String(rawPrice ?? ""), 10);

          return { sku, fileTitle, newPrice, originalRow: index + 2 };
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
            fileTitle: row.fileTitle,
            productId: matchedProduct.id,
            currentPrice: matchedProduct.price,
            newPrice: row.newPrice,
            percentChange:
              parsePrice(matchedProduct.price) === 0
                ? null
                : ((parsePrice(row.newPrice) - parsePrice(matchedProduct.price)) /
                    parsePrice(matchedProduct.price)) *
                  100,
            status:
              parsePrice(matchedProduct.price) === parsePrice(row.newPrice)
                ? "unchanged"
                : "changed",
            message:
              parsePrice(matchedProduct.price) === parsePrice(row.newPrice)
                ? "Giá không thay đổi"
                : "Giá sẽ được thay đổi",
            productTitle: matchedProduct.title,
          };
        } else {
          return {
            sku: row.sku,
            fileTitle: row.fileTitle,
            currentPrice: null,
            newPrice: row.newPrice,
            percentChange: null,
            status: "not_found",
            message: "Không tìm thấy trên Web",
          };
        }
      });

      setPreviewData(preview);
    } catch (error: unknown) {
      console.error("Lỗi đọc file:", error);
      alert("Đã xảy ra lỗi khi đọc file Excel: " + (error instanceof Error ? error.message : "Lỗi không xác định"));
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  // --- 3. HÀM ĐỒNG BỘ DỮ LIỆU LÊN SUPABASE ---
  const handleSyncPrices = async () => {
    const rowsToSync = previewData.filter(
      (r) => r.productId && (r.status === "changed" || r.status === "unchanged"),
    );

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
              .update({ price: row.newPrice, is_out_of_stock: false })
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
    } catch (error: unknown) {
      alert("Lỗi nghiêm trọng khi đồng bộ: " + (error instanceof Error ? error.message : "Lỗi không xác định"));
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
      setAvailabilityChoices(
        Object.fromEntries(missing.map((product) => [product.id, "in_stock"])),
      );
      setShowMissingProducts(true);
      handleLoadOutOfStock();

      alert(`Tìm thấy ${missing.length} sản phẩm không có trong file Excel!`);
    } catch (error: unknown) {
      console.error("Lỗi tìm sản phẩm thiếu:", error);
      alert("Lỗi: " + (error instanceof Error ? error.message : "Lỗi không xác định"));
    } finally {
      setFindingMissing(false);
    }
  };

  const handleApplyAvailability = async () => {
    const selectedProducts = missingProducts.filter(
      (product) => availabilityChoices[product.id],
    );

    if (selectedProducts.length === 0) {
      alert("Vui lòng chọn Còn hàng hoặc Hết hàng cho ít nhất một sản phẩm.");
      return;
    }

    if (
      !confirm(
        `Bạn có chắc muốn cập nhật trạng thái cho ${selectedProducts.length} sản phẩm?`,
      )
    ) {
      return;
    }

    setSavingAvailability(true);
    try {
      const results = await Promise.all(
        selectedProducts.map((product) =>
          supabase
            .from("products")
            .update({
              is_out_of_stock:
                availabilityChoices[product.id] === "out_of_stock",
            })
            .eq("id", product.id),
        ),
      );
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;

      alert("Đã cập nhật trạng thái tồn kho thành công.");
      setAvailabilityChoices({});
    } catch (error: unknown) {
      alert(
        `Không thể cập nhật tồn kho. Hãy chạy SQL_PRODUCT_STOCK_SETUP.sql trước. ${
          error instanceof Error ? error.message : ""
        }`,
      );
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleLoadOutOfStock = async () => {
    setLoadingOutOfStock(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, sku, title, price, category, is_out_of_stock")
        .eq("is_out_of_stock", true)
        .order("title", { ascending: true });

      if (error) throw error;
      setOutOfStockProducts((data || []) as ProductDB[]);
    } catch (error: unknown) {
      console.error("Lỗi tải sản phẩm hết hàng:", error);
      alert(
        "Không thể tải danh sách hết hàng. Hãy chạy SQL_PRODUCT_STOCK_SETUP.sql trước.",
      );
    } finally {
      setLoadingOutOfStock(false);
    }
  };

  const handleRestoreProduct = async (product: ProductDB) => {
    setRestoringProductId(product.id);
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_out_of_stock: false })
        .eq("id", product.id);

      if (error) throw error;
      setOutOfStockProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
    } catch (error: unknown) {
      alert(
        `Không thể đưa sản phẩm về còn hàng: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
      );
    } finally {
      setRestoringProductId(null);
    }
  };

  // --- SUMMARY STATS ---
  const changedCount = previewData.filter((r) => r.status === "changed").length;
  const unchangedCount = previewData.filter((r) => r.status === "unchanged").length;
  const notFoundCount = previewData.filter(
    (r) => r.status === "not_found",
  ).length;
  const visiblePreviewData = [...previewData]
    .filter(
      (row) =>
        (!showFileOnly || row.status === "not_found") &&
        (!showChangedOnly || row.status === "changed"),
    )
    .sort((first, second) => {
      if (!percentSort) return 0;
      if (first.percentChange === null) return 1;
      if (second.percentChange === null) return -1;
      return percentSort === "asc"
        ? first.percentChange - second.percentChange
        : second.percentChange - first.percentChange;
    });

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
                  Phải có cột <strong>&quot;Mã SKU&quot;</strong> để nhận diện sản phẩm.
                </li>
                <li>
                  Cột giá (Ưu tiên đọc theo thứ tự): <strong>&quot;wed&quot;</strong>,{" "}
                  <strong>&quot;Giá bán lẻ&quot;</strong>, <strong>&quot;Giá&quot;</strong> hoặc{" "}
                  <strong>&quot;Price&quot;</strong>.
                </li>
              </ul>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="mt-3 rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
              >
                📄 Tải file Excel mẫu
              </button>
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
                <button
                  type="button"
                  onClick={() => {
                    setShowChangedOnly((current) => !current);
                    setShowFileOnly(false);
                  }}
                  className={`rounded-full px-3 py-1 transition ${
                    showChangedOnly
                      ? "bg-green-600 text-white"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  ✅ Sẽ thay đổi giá: {changedCount}
                </button>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                  Không đổi giá: {unchangedCount}
                </span>
                <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">
                  ⚠️ Không tìm thấy SKU: {notFoundCount}
                </span>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowFileOnly((current) => !current);
                  setShowChangedOnly(false);
                }}
                className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
              >
                {showFileOnly ? "Hiện tất cả dòng" : "Chỉ xem file có, web không có"}
              </button>
              {notFoundCount > 0 && (
                <button
                  type="button"
                  onClick={handleExportFileOnly}
                  className="rounded-lg border border-red-600 bg-white px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
                >
                  📥 Xuất sản phẩm file có, web không có
                </button>
              )}
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
                    <th className="p-3 border-b text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setPercentSort((current) =>
                            current === "asc" ? "desc" : "asc",
                          )
                        }
                        className="font-bold hover:text-blue-600"
                      >
                        % Thay đổi {percentSort === "asc" ? "↑" : percentSort === "desc" ? "↓" : "↕"}
                      </button>
                    </th>
                    <th className="p-3 border-b text-center">Trạng thái</th>
                    <th className="p-3 border-b text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visiblePreviewData.map((row, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 ${row.status === "not_found" ? "bg-red-50" : ""}`}
                    >
                      <td className="p-3 text-gray-500 font-mono">
                        {index + 1}
                      </td>
                      <td className="p-3 min-w-44">
                        {row.productId ? (
                          <input
                            type="text"
                            value={editingSku[row.productId] ?? row.sku}
                            onChange={(event) =>
                              handleSkuChange(row.productId as number, event.target.value)
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            aria-label={`SKU của ${row.productTitle || row.sku}`}
                          />
                        ) : (
                          <span className="font-bold text-gray-800">{row.sku}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div
                          className="font-semibold text-blue-700 line-clamp-1"
                          title={row.productTitle}
                        >
                          {row.productTitle || row.fileTitle || "---"}
                        </div>
                      </td>
                      <td className="p-3 text-right text-gray-500 line-through">
                        {row.currentPrice === null
                          ? "---"
                          : formatPrice(row.currentPrice)}
                      </td>
                      <td className="p-3 text-right font-bold text-red-600 text-base">
                        {formatPrice(row.newPrice)}
                      </td>
                      <td
                        className={`p-3 text-right font-bold ${
                          row.percentChange === null
                            ? "text-gray-400"
                            : row.percentChange > 0
                              ? "text-red-600"
                              : row.percentChange < 0
                                ? "text-green-600"
                                : "text-gray-600"
                        }`}
                      >
                        {row.percentChange === null
                          ? "---"
                          : `${row.percentChange > 0 ? "+" : ""}${row.percentChange.toFixed(2)}%`}
                      </td>
                      <td className="p-3 text-center">
                        {row.status === "changed" ? (
                          <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">
                            Sẽ đổi giá
                          </span>
                        ) : row.status === "unchanged" ? (
                          <span className="text-gray-600 text-xs font-bold bg-gray-100 px-2 py-1 rounded">
                            Không đổi
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
                      <td className="p-3 text-center whitespace-nowrap">
                        {row.productId && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSavePreviewSku(row)}
                              disabled={
                                savingSkuId === row.productId ||
                                deletingProductId === row.productId
                              }
                              className="rounded bg-blue-500 px-2 py-1 text-xs font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                              {savingSkuId === row.productId ? "Đang lưu..." : "💾 Lưu"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePreviewProduct(row)}
                              disabled={
                                savingSkuId === row.productId ||
                                deletingProductId === row.productId
                              }
                              className="ml-1 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                              {deletingProductId === row.productId ? "Đang xóa..." : "🗑️ Xóa"}
                            </button>
                          </>
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
                  "🔍 Tìm SP web có nhưng file không có"
                )}
              </button>
              <button
                onClick={handleSyncPrices}
                disabled={syncing || changedCount + unchangedCount === 0}
                className={`px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2 ${
                  syncing || changedCount + unchangedCount === 0
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
                  `🚀 Đồng bộ giá và trạng thái (${changedCount + unchangedCount} SP)`
                )}
              </button>
            </div>
          </div>
        )}

        {/* SECTION XỬ LÝ SẢN PHẨM THIẾU FILE VÀ SẢN PHẨM HẾT HÀNG */}
        {showMissingProducts && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        {missingProducts.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-300 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-lg text-yellow-700">
                ⚠️ Sản phẩm website có nhưng file không có (
                {missingProducts.length})
                </h2>
                <p className="mt-1 text-sm text-yellow-700">
                  Chọn trạng thái để website biết sản phẩm còn bán hay đã hết hàng.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportWebOnly}
                  className="rounded-lg border border-yellow-600 bg-white px-3 py-2 text-sm font-bold text-yellow-700 hover:bg-yellow-50"
                >
                  📥 Xuất danh sách
                </button>
                <button
                  onClick={() => setShowMissingProducts(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  aria-label="Đóng danh sách"
                >
                  ✕
                </button>
              </div>
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
                    <th className="p-3 border-b text-center min-w-56">Trạng thái tồn kho</th>
                    <th className="p-3 border-b text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-100">
                  {missingProducts.map((product, index) => (
                    <tr key={product.id} className="hover:bg-yellow-50">
                      <td className="p-3 text-gray-500 font-mono">
                        {index + 1}
                      </td>
                      <td className="p-3 min-w-56">
                        <input
                          type="text"
                          value={editingSku[product.id] ?? product.sku ?? ""}
                          onChange={(event) =>
                            handleSkuChange(product.id, event.target.value)
                          }
                          className="w-full rounded border border-yellow-300 px-2 py-1.5 font-bold text-yellow-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          aria-label={`SKU của ${product.title}`}
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-gray-800 line-clamp-2">
                          {product.title}
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{product.category}</td>
                      <td className="p-3 text-right font-bold text-gray-800">
                        {formatPrice(product.price)} đ
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setAvailabilityChoices((current) => ({
                                ...current,
                                [product.id]: "in_stock",
                              }))
                            }
                            className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                              availabilityChoices[product.id] === "in_stock"
                                ? "border-green-600 bg-green-600 text-white"
                                : "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            Còn hàng
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setAvailabilityChoices((current) => ({
                                ...current,
                                [product.id]: "out_of_stock",
                              }))
                            }
                            className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                              availabilityChoices[product.id] === "out_of_stock"
                                ? "border-red-600 bg-red-600 text-white"
                                : "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                          >
                            Hết hàng
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleSaveSku(product)}
                          disabled={
                            savingSkuId === product.id ||
                            deletingProductId === product.id
                          }
                          className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                          {savingSkuId === product.id ? "Đang lưu..." : "💾 Lưu SKU"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product)}
                          disabled={
                            savingSkuId === product.id ||
                            deletingProductId === product.id
                          }
                          className="ml-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                          {deletingProductId === product.id
                            ? "Đang xóa..."
                            : "🗑️ Xóa"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-yellow-700">
                💡 <strong>Ghi chú:</strong> Đây là các sản phẩm đang có trên
                website nhưng không xuất hiện trong file Excel vừa tải lên.
                Bạn nên kiểm tra lại file Sapo trước khi đồng bộ.
              </p>
              <button
                type="button"
                onClick={handleApplyAvailability}
                disabled={savingAvailability}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {savingAvailability ? "Đang cập nhật..." : "Lưu trạng thái đã chọn"}
              </button>
            </div>
          </div>
        )}

        {/* TRƯỜNG HỢP TÌM KHÔNG CÓ SẢN PHẨM THIẾU */}
        {missingProducts.length === 0 && (
          <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-300 animate-fadeIn">
            <p className="text-green-700 text-center font-semibold">
              ✅ Tất cả sản phẩm trên website đều có trong file Excel.
            </p>
          </div>
        )}

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300 animate-fadeIn">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-bold text-lg text-gray-800">
                📦 Sản phẩm đang hết hàng ({outOfStockProducts.length})
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Đưa sản phẩm trở lại trạng thái bán hàng.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadOutOfStock}
              disabled={loadingOutOfStock}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingOutOfStock ? "Đang tải..." : "↻ Làm mới"}
            </button>
          </div>

          {loadingOutOfStock ? (
            <p className="py-8 text-center text-sm text-gray-500">Đang tải danh sách...</p>
          ) : outOfStockProducts.length === 0 ? (
            <p className="rounded-lg bg-green-50 px-3 py-4 text-center text-sm font-medium text-green-700">
              Không có sản phẩm nào đang hết hàng.
            </p>
          ) : (
            <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
              {outOfStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <p className="font-semibold text-gray-800 line-clamp-2">{product.title}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    SKU: {product.sku || "Chưa có SKU"}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRestoreProduct(product)}
                    disabled={restoringProductId === product.id}
                    className="mt-3 w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {restoringProductId === product.id
                      ? "Đang cập nhật..."
                      : "✓ Đưa về còn hàng"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
          </div>
        )}
      </div>
    </div>
  );
}
