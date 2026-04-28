"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Search, Menu, X, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import BagDrawer from "@/components/BagDrawer";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import {
  getWishlistCount,
  wishlistChangedEvent,
} from "@/utils/wishlist";
import { clearClientAuth } from "@/utils/clientAuth";

export function Navbar() {
  const [bagOpen, setBagOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [liked, setLiked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user } = useAuthStore();
  const { items: cartItems, getTotalItems } = useCartStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setIsAdmin(user?.role === "admin");
  }, [user]);

  useEffect(() => {
    const syncWishlistCount = () => {
      try {
        setWishlistCount(getWishlistCount());
      } catch (error) {
        console.error("Error reading wishlist:", error);
        setWishlistCount(0);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      // ✅ No longer needed - wishlist is backend-driven
      // Wishlist changes are now handled by wishlistChangedEvent
    };

    syncWishlistCount();
    window.addEventListener(wishlistChangedEvent, syncWishlistCount);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(wishlistChangedEvent, syncWishlistCount);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    setCartCount(getTotalItems());
  }, [cartItems, getTotalItems]);

  const handleLogout = () => {
    clearClientAuth({ dispatchEvent: true });
    router.push("/login");
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActivePath = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const displayName =
    user?.name || user?.username || user?.email?.split("@")[0] || "Profile";

  const getNavLinkClassName = (href: string) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
      isActivePath(href)
        ? "bg-[#f7e7ea] text-[#7a1f2b]"
        : "text-[#4a2c2a] hover:bg-[#f7e7ea] hover:text-[#7a1f2b]"
    }`;

  const getMobileNavLinkClassName = (href: string) =>
    `block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 ${
      isActivePath(href)
        ? "bg-[#f7e7ea] text-[#7a1f2b]"
        : "text-[#4a2c2a] hover:bg-[#f7e7ea] hover:text-[#7a1f2b]"
    }`;

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedQuery = userInput.trim();

    if (!normalizedQuery) {
      router.push("/shop");
      setIsMenuOpen(false);
      return;
    }

    router.push(`/shop?q=${encodeURIComponent(normalizedQuery)}`);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="overflow-hidden whitespace-nowrap border-b border-[#ead2d8]/50 bg-gradient-to-r from-[#f7e7ea]/90 via-[#f3ede7]/90 to-[#e8d5c4]/90 backdrop-blur-md">
        <div className="animate-marquee inline-block px-4 py-2.5 text-xs font-medium text-[#4a2c2a] md:text-sm">
          First Order: Get Extra 10% Off on Rs. 700+ &nbsp;&nbsp;•&nbsp;&nbsp; Up to 50% Off + Surprise Gifts &nbsp;&nbsp;•&nbsp;&nbsp; Free Shipping on Orders Above Rs. 999
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-[#ead2d8]/50 bg-white/95 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-md transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link
              href="/"
              className={`group flex-shrink-0 rounded-lg transition-all duration-200 ${
                pathname === "/" ? "ring-2 ring-[#7a1f2b]/15 ring-offset-2 ring-offset-white" : ""
              }`}
            >
              <img
                src="/favicon/logo.png"
                alt="Ewara Logo"
                className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 md:h-10"
              />
            </Link>

            <form
              onSubmit={handleSearchSubmit}
              className="mx-8 hidden flex-1 items-center rounded-full border border-[#ead2d8] bg-[#fdf8f6] px-4 py-2.5 transition-all duration-200 hover:border-[#7a1f2b]/30 focus-within:border-[#7a1f2b] focus-within:ring-2 focus-within:ring-[#7a1f2b]/10 md:flex"
            >
              <Search size={18} className="flex-shrink-0 text-[#9c8b87]" />
              <input
                type="text"
                placeholder="Search products, brands..."
                className="w-full bg-transparent px-3 text-sm text-[#4a2c2a] outline-none placeholder:text-[#b5a9a4]"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-full bg-[#7a1f2b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#8d2742]"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2 md:gap-6">
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`transition-all duration-200 ${
                    user
                      ? "flex items-center gap-[5px] rounded-[20px] bg-[#2a0a18] px-3 py-[7px] hover:opacity-95"
                      : "rounded-lg p-2 hover:bg-[#fdf0f3]"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={user ? "#f9c8d8" : "#5a1228"}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {user && (
                    <span className="max-w-[110px] truncate text-[11px] font-semibold text-[#f9c8d8]">
                      {displayName}
                    </span>
                  )}
                </button>

                {isProfileOpen && (
                  <div className="animation-in absolute right-0 top-full z-50 mt-3 w-48 overflow-hidden rounded-lg border border-[#ead2d8] bg-white shadow-lg">
                    {!user ? (
                      <Link
                        href="/login"
                        onClick={() => setIsProfileOpen(false)}
                        className="block border-b border-[#ead2d8] px-4 py-3 text-sm font-medium text-[#4a2c2a] transition-colors duration-200 hover:bg-[#f7e7ea]"
                      >
                        Sign In
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full border-b border-[#ead2d8] px-4 py-3 text-left text-sm font-medium text-[#4a2c2a] transition-colors duration-200 hover:bg-[#f7e7ea]"
                      >
                        Logout
                      </button>
                    )}

                    {user && (
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="block border-b border-[#ead2d8] px-4 py-3 text-sm text-[#6b7280] transition-colors duration-200 hover:bg-[#f7e7ea] hover:text-[#4a2c2a]"
                      >
                        My Profile
                      </Link>
                    )}

                    <Link
                      href="/help"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-3 text-sm text-[#6b7280] transition-colors duration-200 hover:bg-[#f7e7ea] hover:text-[#4a2c2a]"
                    >
                      Help & Support
                    </Link>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (!user) {
                    alert("Please login first");
                    return;
                  }
                  setLiked(!liked);
                  router.push("/wishlist");
                }}
                className="group relative rounded-lg p-2 transition-colors duration-200 hover:bg-[#fdf0f3]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={liked ? "#7b1d3a" : "none"}
                  stroke="#5a1228"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 transition-all duration-300"
                  aria-hidden="true"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-[#7a1f2b] px-2 py-0.5 text-xs font-bold leading-none text-white">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setBagOpen(true)}
                className="group relative rounded-lg p-2 transition-colors duration-200 hover:bg-[#fdf0f3]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#5a1228"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute right-0 top-0 inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#7b1d3a] text-[9px] font-bold leading-none text-white">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMenuOpen(true)}
                className="rounded-lg p-2 transition-colors duration-200 hover:bg-[#f7e7ea] md:hidden"
              >
                <Menu className="h-5 w-5 text-[#4a2c2a]" />
              </button>
            </div>
          </div>

          <div className="hidden items-center justify-center gap-1 border-t border-[#ead2d8]/30 py-3 md:flex">
            <Link
              href="/new-arrivals"
              className={getNavLinkClassName("/new-arrivals")}
            >
              New Arrivals
            </Link>

            <Link
              href="/category"
              className={getNavLinkClassName("/category")}
            >
              Category
            </Link>

            <Link
              href="/shop"
              className={getNavLinkClassName("/shop")}
            >
              Shop
            </Link>

            <Link
              href="/services"
              className={getNavLinkClassName("/services")}
            >
              Services
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-lg bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:shadow-md"
              >
                Admin Panel
              </Link>
            )}

            <Link
              href="/offers"
              className={`ml-2 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition-all duration-200 ${
                isActivePath("/offers")
                  ? "bg-[#7a1f2b] shadow-lg"
                  : "bg-gradient-to-r from-[#7a1f2b] via-[#d4a373] to-[#7a1f2b] hover:scale-105 hover:shadow-lg"
              }`}
            >
              <Sparkles size={16} />
              Offers
              <Sparkles size={16} />
            </Link>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          <div className="absolute left-0 top-0 flex h-full w-full max-w-xs flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ead2d8] px-6 py-5">
              <h2 className="text-lg font-bold text-[#4a2c2a]">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg p-2 transition-colors duration-200 hover:bg-[#f7e7ea]"
              >
                <X className="h-5 w-5 text-[#4a2c2a]" />
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto px-6 py-6">
              <form
                onSubmit={handleSearchSubmit}
                className="mb-6 flex items-center gap-2 rounded-lg border border-[#ead2d8] bg-[#fdf8f6] px-3 py-2"
              >
                <Search size={16} className="text-[#9c8b87]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-transparent px-2 text-sm text-[#4a2c2a] outline-none"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#7a1f2b] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#8d2742]"
                >
                  Go
                </button>
              </form>

              <Link
                href="/shop"
                onClick={() => setIsMenuOpen(false)}
                className={getMobileNavLinkClassName("/shop")}
              >
                Shop
              </Link>

              <Link
                href="/new-arrivals"
                onClick={() => setIsMenuOpen(false)}
                className={getMobileNavLinkClassName("/new-arrivals")}
              >
                New Arrivals
              </Link>

              <Link
                href="/category"
                onClick={() => setIsMenuOpen(false)}
                className={getMobileNavLinkClassName("/category")}
              >
                Category
              </Link>

              <Link
                href="/services"
                onClick={() => setIsMenuOpen(false)}
                className={getMobileNavLinkClassName("/services")}
              >
                Services
              </Link>

              <div className="my-4 border-t border-[#ead2d8]" />

              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className={getMobileNavLinkClassName("/profile")}
              >
                My Profile
              </Link>

              <Link
                href="/help"
                onClick={() => setIsMenuOpen(false)}
                className={getMobileNavLinkClassName("/help")}
              >
                Help & Support
              </Link>

              <div className="my-4 border-t border-[#ead2d8]" />

              <Link
                href="/offers"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-4 py-3 text-base font-bold text-white transition-all duration-200 ${
                  isActivePath("/offers")
                    ? "bg-[#7a1f2b] shadow-lg"
                    : "bg-gradient-to-r from-[#7a1f2b] via-[#d4a373] to-[#7a1f2b] hover:shadow-lg"
                }`}
              >
                <Sparkles size={18} />
                Offers
                <Sparkles size={18} />
              </Link>
            </div>

            <div className="border-t border-[#ead2d8] px-6 py-5">
              <button
                onClick={() => {
                  if (!user) {
                    setIsMenuOpen(false);
                    router.push("/login");
                  } else {
                    handleLogout();
                    setIsMenuOpen(false);
                  }
                }}
                className="w-full rounded-lg bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] px-4 py-3 font-bold text-white transition-all duration-200 hover:shadow-lg"
              >
                {user ? "Logout" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BagDrawer open={bagOpen} setOpen={setBagOpen} />
    </>
  );
}
