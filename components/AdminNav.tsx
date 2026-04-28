"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearClientAuth } from "@/utils/clientAuth";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href;

  const handleAdminExit = () => {
    clearClientAuth({ dispatchEvent: true });
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-[#ead2d8] bg-[#fdf8f6] shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#4a2c2a]">Admin Panel</h2>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive("/admin")
                  ? "bg-[#7a1f2b] text-white"
                  : "text-[#5e3339] hover:bg-[#f7e7ea]"
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/admin/products"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname.startsWith("/admin/products")
                  ? "bg-[#7a1f2b] text-white"
                  : "text-[#5e3339] hover:bg-[#f7e7ea]"
              }`}
            >
              Products
            </Link>

            <Link
              href="/admin/orders"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive("/admin/orders")
                  ? "bg-[#7a1f2b] text-white"
                  : "text-[#5e3339] hover:bg-[#f7e7ea]"
              }`}
            >
              Orders
            </Link>

            <Link
              href="/admin/coupons"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive("/admin/coupons")
                  ? "bg-[#7a1f2b] text-white"
                  : "text-[#5e3339] hover:bg-[#f7e7ea]"
              }`}
            >
              Coupons
            </Link>

            <Link
              href="/admin/users"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive("/admin/users")
                  ? "bg-[#7a1f2b] text-white"
                  : "text-[#5e3339] hover:bg-[#f7e7ea]"
              }`}
            >
              Users
            </Link>

            <Link
              href="/admin/reviews"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive("/admin/reviews")
                  ? "bg-[#7a1f2b] text-white"
                  : "text-[#5e3339] hover:bg-[#f7e7ea]"
              }`}
            >
              Reviews
            </Link>

            <button
              onClick={handleAdminExit}
              className="ml-4 rounded-full border border-[#7a1f2b] bg-[#7a1f2b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5a1620]"
            >
              Exit Admin
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
