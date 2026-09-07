export function parsePrice(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const raw = String(value ?? "").trim();
  if (!raw) return 0;

  const digits = raw.replace(/[^\d-]/g, "");
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatPrice(value: number | string | null | undefined) {
  return parsePrice(value).toLocaleString("vi-VN");
}
