"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Search, Menu, X, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import BagDrawer from "@/components/BagDrawer";
import { buildApiUrl } from "@/utils/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { getWishlistCount, wishlistChangedEvent } from "@/utils/wishlist";
import { clearClientAuth } from "@/utils/clientAuth";

interface ActiveOffer {
  _id: string;
  text: string;
  isActive: boolean;
  displayOrder: number;
}

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
  const [marqueeOffers, setMarqueeOffers] = useState<string[]>([
    "First Order: Get Extra 10% Off on Rs. 700+",
    "Up to 50% Off + Surprise Gifts",
    "Free Shipping on Orders Above Rs. 999",
  ]);

  useEffect(() => {
    setIsAdmin(user?.role === "admin");
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const loadOffers = async () => {
      try {
        const response = await fetch(buildApiUrl("/api/offers"), {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success || !Array.isArray(data.offers)) {
          return;
        }

        const nextOffers = data.offers
          .map((offer: ActiveOffer) => String(offer?.text || "").trim())
          .filter(Boolean);

        if (isMounted && nextOffers.length > 0) {
          setMarqueeOffers(nextOffers);
        }
      } catch (error) {
        console.error("Failed to load marquee offers:", error);
      }
    };

    loadOffers();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    const syncWishlistCount = () => {
      try {
        setWishlistCount(getWishlistCount());
      } catch (error) {
        console.error("Error reading wishlist:", error);
        setWishlistCount(0);
      }
    };

    const handleStorage = () => {};

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
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
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

  const displayName = user?.name || user?.email?.split("@")[0] || "Profile";

  const getNavLinkClassName = (href: string) =>
    `rounded-full px-4 py-2.5 text-sm font-medium tracking-[-0.01em] transition-all duration-200 ${
      isActivePath(href)
        ? "bg-white text-[var(--brand-primary)] shadow-card"
        : "text-[var(--text-secondary)] hover:bg-white/80 hover:text-[var(--text-primary)]"
    }`;

  const getMobileNavLinkClassName = (href: string) =>
    `block rounded-2xl px-4 py-3 text-base font-medium tracking-[-0.01em] transition-all duration-200 ${
      isActivePath(href)
        ? "bg-white text-[var(--brand-primary)] shadow-card"
        : "text-[var(--text-secondary)] hover:bg-white/80 hover:text-[var(--text-primary)]"
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

  const marqueeItems = [...marqueeOffers, ...marqueeOffers];

  return (
    <>
      <div className="overflow-hidden border-b border-[var(--border-muted)] bg-[#f8efe8]">
        <div className="announcement-marquee flex h-9 items-center whitespace-nowrap">
          {marqueeItems.map((offer, index) => (
            <span
              key={`${offer}-${index}`}
              className="px-10 text-[12px] font-medium tracking-[0.04em] text-[#6f5449]"
            >
              {offer}
              <span className="ml-10 opacity-30">✦</span>
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-[var(--border-muted)] bg-[rgba(253,249,246,0.82)] shadow-[0_2px_18px_rgba(67,43,31,0.04)] backdrop-blur-xl transition-all duration-300">
        <div className="section-shell px-1">
          <div className="flex items-center justify-between py-4 md:py-5">
            <Link
              href="/"
              className={`group flex-shrink-0 rounded-2xl transition-all duration-200 ${
                pathname === "/"
                  ? "ring-2 ring-[var(--brand-primary)]/10 ring-offset-4 ring-offset-[var(--surface-elevated)]"
                  : ""
              }`}
              aria-label="Go to homepage"
            >
              <img
                src="/logoewara.jpeg"
                alt="Ewara Logo"
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <form
              onSubmit={handleSearchSubmit}
              className="mx-8 hidden flex-1 items-center rounded-full border border-[var(--border-soft)] bg-white/80 px-5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all duration-200 hover:border-[var(--brand-primary)]/25 focus-within:border-[var(--brand-primary)] focus-within:ring-4 focus-within:ring-[var(--brand-primary)]/8 md:flex"
            >
              <Search size={18} className="flex-shrink-0 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search products, brands..."
                className="w-full bg-transparent px-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[var(--brand-primary-strong)]"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`transition-all duration-200 ${
                    user
                      ? "flex items-center gap-2 rounded-full bg-[var(--brand-primary-strong)] px-3.5 py-2 hover:opacity-95"
                      : "rounded-2xl p-2.5 hover:bg-white/80"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={user ? "#f9d6de" : "#5a1228"}
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
                    <span className="max-w-[120px] truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[#f9d6de]">
                      {displayName}
                    </span>
                  )}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-52 overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-white shadow-soft">
                    {!user ? (
                      <Link
                        href="/login"
                        onClick={() => setIsProfileOpen(false)}
                        className="block border-b border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--surface-base)]"
                      >
                        Sign In
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full border-b border-[var(--border-soft)] px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--surface-base)]"
                      >
                        Logout
                      </button>
                    )}

                    {user && (
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="block border-b border-[var(--border-soft)] px-4 py-3 text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--surface-base)] hover:text-[var(--text-primary)]"
                      >
                        My Profile
                      </Link>
                    )}

                    <Link
                      href="/help"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-3 text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--surface-base)] hover:text-[var(--text-primary)]"
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
                className="group relative rounded-2xl p-2.5 transition-colors duration-200 hover:bg-white/80"
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
                  <span className="absolute right-1 top-1 inline-flex -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-[var(--brand-primary)] px-2 py-0.5 text-xs font-bold leading-none text-white">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setBagOpen(true)}
                className="group relative rounded-2xl p-2.5 transition-colors duration-200 hover:bg-white/80"
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
                  <span className="absolute right-0 top-0 inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-[var(--brand-primary)] text-[9px] font-bold leading-none text-white">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMenuOpen(true)}
                className="rounded-2xl p-2.5 transition-colors duration-200 hover:bg-white/80 md:hidden"
              >
                <Menu className="h-5 w-5 text-[var(--text-primary)]" />
              </button>
            </div>
          </div>

          <div className="hidden items-center justify-center gap-2 border-t border-[var(--border-muted)] py-4 md:flex">
            <Link href="/new-arrivals" className={getNavLinkClassName("/new-arrivals")}>
              New Arrivals
            </Link>
            <Link href="/category" className={getNavLinkClassName("/category")}>
              Category
            </Link>
            <Link href="/shop" className={getNavLinkClassName("/shop")}>
              Shop
            </Link>
            <Link href="/services" className={getNavLinkClassName("/services")}>
              Services
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary-strong)] px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:shadow-md"
              >
                Admin Panel
              </Link>
            )}

            <Link
              href="/offers"
              className={`ml-2 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 ${
                isActivePath("/offers")
                  ? "bg-[var(--brand-primary)] shadow-lg"
                  : "bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-accent)] to-[var(--brand-primary)] hover:scale-105 hover:shadow-lg"
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

          <div className="absolute left-0 top-0 flex h-full w-full max-w-xs flex-col bg-[#fcf7f2] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-6 py-5">
              <h2 className="text-lg font-bold tracking-[-0.02em] text-[var(--text-primary)]">
                Menu
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl p-2 transition-colors duration-200 hover:bg-white"
              >
                <X className="h-5 w-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto px-6 py-6">
              <form
                onSubmit={handleSearchSubmit}
                className="mb-6 flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3"
              >
                <Search size={16} className="text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-transparent px-2 text-sm text-[var(--text-primary)] outline-none"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="rounded-full bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--brand-primary-strong)]"
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

              <div className="my-4 border-t border-[var(--border-soft)]" />

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

              <div className="my-4 border-t border-[var(--border-soft)]" />

              <Link
                href="/offers"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-base font-bold text-white transition-all duration-200 ${
                  isActivePath("/offers")
                    ? "bg-[var(--brand-primary)] shadow-lg"
                    : "bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-accent)] to-[var(--brand-primary)] hover:shadow-lg"
                }`}
              >
                <Sparkles size={18} />
                Offers
                <Sparkles size={18} />
              </Link>
            </div>

            <div className="border-t border-[var(--border-soft)] px-6 py-5">
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
                className="w-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary-strong)] px-4 py-3 font-bold text-white transition-all duration-200 hover:shadow-lg"
              >
                {user ? "Logout" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BagDrawer open={bagOpen} setOpen={setBagOpen} />
      <style jsx>{`
        .announcement-marquee {
          animation: marquee 18s linear infinite;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </>
  );
}
