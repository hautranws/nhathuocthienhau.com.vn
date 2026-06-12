"use client";
import React from "react";
import Link from "next/link";
import AdminBannerManager from "@/components/admin/AdminBannerManager";

export default function BannersPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          ← Quay lại Bảng điều khiển
        </Link>
      </div>

      <AdminBannerManager />
    </div>
  );
}
