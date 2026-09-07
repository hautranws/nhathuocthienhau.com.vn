"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const bannerShownKey = "thien-hau-purchase-channel-banner-shown-v2";
const zaloOaUrl = "https://zalo.me/3788256104237241918";

export default function PurchaseChannelBanner() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let showTimer: number | undefined;

    try {
      if (window.localStorage.getItem(bannerShownKey)) return;

      window.localStorage.setItem(bannerShownKey, "true");
      showTimer = window.setTimeout(() => setIsVisible(true), 0);
    } catch {
      showTimer = window.setTimeout(() => setIsVisible(true), 0);
    }

    return () => {
      if (showTimer !== undefined) window.clearTimeout(showTimer);
    };
  }, []);

  const closeBanner = () => setIsVisible(false);
  const chooseWebsite = () => {
    closeBanner();
    router.push("/login");
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-channel-title"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-blue-700 px-6 pb-7 pt-8 text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">
            Nhà thuốc Thiên Hậu
          </p>
          <h2 id="purchase-channel-title" className="mt-3 text-2xl font-bold">
            Bạn muốn mua hàng qua?
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5">
          <button
            type="button"
            onClick={chooseWebsite}
            className="flex min-h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-blue-700 bg-blue-700 px-3 py-4 text-center text-white transition hover:bg-blue-800"
          >
            <img
              src="/logo-thien-hau.png"
              alt="Logo Nhà thuốc Thiên Hậu"
              className="mb-3 h-16 w-28 rounded-md bg-white object-contain p-2"
            />
            <span className="block text-sm font-bold sm:text-base">Website Thiên Hậu</span>
            <span className="mt-1 block text-xs text-blue-100 sm:text-sm">
              Tiếp tục mua hàng
            </span>
          </button>

          <a
            href={zaloOaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeBanner}
            className="flex min-h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-[#0068ff] px-3 py-4 text-center text-[#0054cc] transition hover:bg-blue-50"
          >
            <img
              src="https://img.icons8.com/color/96/zalo.png"
              alt="Logo Zalo OA"
              className="mb-3 h-16 w-16 object-contain"
            />
            <span className="block text-sm font-bold sm:text-base">Zalo OA Thiên Hậu</span>
            <span className="mt-1 block text-xs text-blue-700 sm:text-sm">
              Nhắn tin với nhà thuốc
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}