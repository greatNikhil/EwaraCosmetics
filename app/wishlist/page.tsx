"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile?tab=wishlist");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdf6f7] px-4">
      <div className="rounded-[14px] border border-[#f0dde2] bg-white px-6 py-4 text-sm text-[#7f6b73] shadow-sm">
        Opening your wishlist...
      </div>
    </div>
  );
}
