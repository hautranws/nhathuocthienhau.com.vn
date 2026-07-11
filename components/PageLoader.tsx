'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  // Ẩn loader khi điều hướng hoàn tất (pathname đổi)
  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  // Hiện loader khi click vào link nội bộ
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (
        anchor &&
        anchor.href &&
        !anchor.target &&
        !anchor.href.startsWith('mailto:') &&
        !anchor.href.startsWith('tel:') &&
        anchor.origin === window.location.origin &&
        anchor.pathname !== window.location.pathname
      ) {
        setLoading(true);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center gap-3 bg-white rounded-2xl shadow-lg px-10 py-8">
        <Image
          src="/logo-thienhau-tab.png"
          alt="Đang tải..."
          width={72}
          height={72}
          className="animate-spin"
          style={{ animationDuration: '1s', animationTimingFunction: 'linear' }}
        />
        <p className="text-gray-500 text-sm font-medium tracking-wide">Đang tải...</p>
      </div>
    </div>
  );
}
