"use client";

import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";

interface CustomerRow {
  name: string;
  phone: string;
  points: number;
}

const normalizeKey = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const normalizePhoneCell = (value: unknown) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("84")) return `0${digits.slice(2).replace(/^0/, "")}`;
  return digits.length === 9 ? `0${digits}` : digits;
};

const normalizePointsCell = (value: unknown) => {
  const points = Number(String(value ?? "0").replace(/[^\d.-]/g, ""));
  return Number.isFinite(points) ? points : 0;
};

export default function CustomerImportPage() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Tên", "Số điện thoại", "Điểm"],
      ["Nguyễn Văn A", "0981234567", 10],
      ["Trần Thị B", "0912345678", 25],
    ]);
    worksheet["B2"].t = "s";
    worksheet["B3"].t = "s";
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Khach_Hang");
    XLSX.writeFile(workbook, "Mau_nhap_khach_hang.xlsx");
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setMessage("");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
        header: 1,
        defval: "",
        raw: true,
      });
      const headers = (matrix[0] ?? []).map(normalizeKey);
      const findColumn = (names: string[], fallback: number) => {
        const index = headers.findIndex((header) => names.includes(header));
        return index >= 0 ? index : fallback;
      };
      const nameColumn = findColumn(["ten", "hoten", "name", "fullname"], 0);
      const phoneColumn = findColumn(["sodienthoai", "sdt", "phone", "phonenumber"], 1);
      const pointsColumn = findColumn(["diem", "diemtichluy", "points", "loyaltypoints"], 2);
      const parsed = matrix.slice(1).map((row) => ({
        name: String(row[nameColumn] ?? "").trim(),
        phone: normalizePhoneCell(row[phoneColumn]),
        points: normalizePointsCell(row[pointsColumn]),
      })).filter((row) => row.name || row.phone);

      setRows(parsed);
      setMessage(`Đã đọc ${parsed.length} khách hàng. Kiểm tra dữ liệu rồi bấm nhập.`);
    } catch {
      setRows([]);
      setMessage("Không đọc được file Excel. Hãy kiểm tra đúng cột Tên, Số điện thoại, Điểm.");
    }
  };

  const importCustomers = async () => {
    if (!rows.length) return;
    setLoading(true);
    setProgress(5);
    setMessage("");
    setImportErrors([]);
    const progressTimer = setInterval(() => {
      setProgress((current) => (current >= 90 ? current : current + 5));
    }, 700);

    try {
      const response = await fetch("/api/admin/import-customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customers: rows }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || `Nhập dữ liệu thất bại (HTTP ${response.status}).`);
      setProgress(100);
      setImportErrors(result.errors ?? []);
      setMessage(`Đã cập nhật ${result.imported} khách hàng${result.failed ? `, lỗi ${result.failed} dòng` : ""}.`);
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : "Nhập dữ liệu thất bại."}`);
    } finally {
      clearInterval(progressTimer);
      setLoading(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-800">Cập nhật khách hàng</h1>
        <p className="mt-2 text-sm text-gray-600">
          Nhập file Excel gồm các cột: <b>Tên</b>, <b>Số điện thoại</b>, <b>Điểm</b>.
        </p>
        <p className="mt-1 text-sm font-medium text-blue-700">
          Nếu số điện thoại đã có trên hệ thống, tên và điểm sẽ được thay thế theo file mới; điểm không cộng dồn.
        </p>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-md">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-8 text-center hover:bg-blue-100">
            <span className="text-4xl">📄</span>
            <span className="mt-2 font-bold text-blue-700">Chọn file Excel khách hàng</span>
              <span className="mt-1 text-xs text-gray-500">Hỗ trợ .xlsx và .xls</span>
            <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
          </label>
            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-4 rounded-lg border border-blue-600 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
            >
              Tải file Excel mẫu
            </button>
          {fileName && <p className="mt-3 text-sm text-gray-600">File: {fileName}</p>}

          {rows.length > 0 && (
            <>
              <div className="mt-5 overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-blue-50 text-blue-800">
                    <tr><th className="p-3">#</th><th className="p-3">Tên khách hàng</th><th className="p-3">Số điện thoại</th><th className="p-3">Điểm</th></tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 100).map((row, index) => (
                      <tr key={`${row.phone}-${index}`} className="border-t">
                        <td className="p-3">{index + 1}</td><td className="p-3">{row.name}</td><td className="p-3">{row.phone}</td><td className="p-3">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 100 && <p className="mt-2 text-xs text-gray-500">Đang xem 100 dòng đầu, hệ thống vẫn nhập toàn bộ {rows.length} dòng.</p>}
              <button type="button" onClick={importCustomers} disabled={loading} className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-gray-400">
                {loading ? "Đang cập nhật..." : `Cập nhật ${rows.length} khách hàng`}
              </button>
              {loading && (
                <div className="mt-4" aria-live="polite">
                  <div className="mb-1 flex justify-between text-xs font-semibold text-blue-700">
                    <span>Đang xử lý dữ liệu khách hàng...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-blue-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
          {message && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}
          {importErrors.length > 0 && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold text-red-800">
                  Chi tiết {importErrors.length} dòng bị lỗi
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([importErrors.map((error, index) => `${index + 1}. ${error}`).join("\n")], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "loi-nhap-khach-hang.txt";
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                >
                  Tải danh sách lỗi
                </button>
              </div>
              <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-red-200 bg-white">
                <ol className="divide-y divide-red-100 text-sm text-red-700">
                  {importErrors.map((error, index) => (
                    <li key={`${error}-${index}`} className="px-3 py-2">
                      <span className="mr-2 font-bold">{index + 1}.</span>{error}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
