"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href;

  const handleAdminExit = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminData"); // Optional cleanup
    window.dispatchEvent(new Event("userChanged")); // Trigger navbar update
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#fdf8f6] border-b border-[#ead2d8] shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#4a2c2a]">Admin Panel</h2>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                isActive("/admin")
                  ? "bg-[#7a1f2b] text-white"
                  : "text-[#5e3339] hover:bg-[#f7e7ea]"
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/admin/products"
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                pathname.startsWith("/admin/products")
                  ? "bg-[#7a1f2b] text-white"
                  : "text-[#5e3339] hover:bg-[#f7e7ea]"
              }`}
            >
              Products
            </Link>

            <Link
              href="/admin/orders"
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                isActive("/admin/orders")
                  ? "bg-[#7a1f2b] text-white"
                  : "text-[#5e3339] hover:bg-[#f7e7ea]"
              }`}
            >
              Orders
            </Link>

            <button
              onClick={handleAdminExit}
              className="ml-4 px-4 py-2 rounded-full text-sm font-medium text-white bg-[#7a1f2b] border border-[#7a1f2b] hover:bg-[#5a1620] transition"
            >
              Exit Admin
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
