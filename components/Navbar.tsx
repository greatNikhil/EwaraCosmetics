"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Search, LogOut, Settings, Menu, X } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Heart, ShoppingBag, User } from "lucide-react";
import { useRouter } from "next/navigation";
import BagDrawer from "@/components/BagDrawer";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export function Navbar() {
  const [bagOpen, setBagOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [liked, setLiked] = useState(false);
  const router = useRouter();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, logout } = useAuthStore();
  const { items: cartItems, getTotalItems } = useCartStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setIsAdmin(user?.role === "admin");
  }, [user]);

  useEffect(() => {
    const storedWishlist = localStorage.getItem("wishlist");
    if (storedWishlist) {
      try {
        const wishlist = JSON.parse(storedWishlist);
        setWishlistCount(wishlist.length);
      } catch (error) {
        console.error("Error parsing wishlist:", error);
      }
    }
  }, []);

  useEffect(() => {
    setCartCount(getTotalItems());
  }, [cartItems]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    router.push("/login");
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        // User data available
      }
    };
    window.addEventListener("userChanged", updateUser);
    return () => {
      window.removeEventListener("userChanged", updateUser);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* TOP OFFER BANNER */}
      <div className="overflow-hidden whitespace-nowrap bg-gradient-to-r from-[#f7e7ea]/90 via-[#f3ede7]/90 to-[#e8d5c4]/90 backdrop-blur-md border-b border-[#ead2d8]/50">
        <div className="animate-marquee inline-block px-4 py-2.5 text-xs md:text-sm font-medium text-[#4a2c2a]">
          ✨ First Order: Get Extra 10% Off on ₹700+ &nbsp;&nbsp;✦✦&nbsp;&nbsp; ✨ Up
          to 50% Off + Surprise Gifts &nbsp;&nbsp;✦✦&nbsp;&nbsp; ✨ Free Shipping on
          Orders Above ₹999 ✨
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#ead2d8]/50 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          {/* Top Row */}
          <div className="flex items-center justify-between py-4">
            {/* LOGO */}
            <Link href="/" className="flex-shrink-0 group">
              <img
                src="/favicon/logo.png"
                alt="Ewara Logo"
                className="h-8 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* SEARCH BAR - HIDDEN ON MOBILE */}
            <div className="hidden md:flex flex-1 mx-8 items-center bg-[#fdf8f6] rounded-full border border-[#ead2d8] px-4 py-2.5 hover:border-[#7a1f2b]/30 focus-within:border-[#7a1f2b] focus-within:ring-2 focus-within:ring-[#7a1f2b]/10 transition-all duration-200">
              <Search size={18} className="text-[#9c8b87] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search products, brands..."
                className="bg-transparent outline-none px-3 w-full text-sm text-[#4a2c2a] placeholder-[#b5a9a4]"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
            </div>

            {/* RIGHT ICONS */}
            <div className="flex items-center gap-2 md:gap-6">
              {/* PROFILE - DESKTOP */}
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-2 hover:bg-[#f7e7ea] rounded-lg transition-colors duration-200"
                >
                  <User className="h-5 w-5 text-[#4a2c2a]" />
                </button>

                {/* PROFILE DROPDOWN */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-48 rounded-lg bg-white border border-[#ead2d8] shadow-lg overflow-hidden z-50 animation-in">
                    {!user ? (
                      <Link
                        href="/login"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-3 text-sm font-medium text-[#4a2c2a] hover:bg-[#f7e7ea] border-b border-[#ead2d8] transition-colors duration-200"
                      >
                        Sign In
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-[#4a2c2a] hover:bg-[#f7e7ea] border-b border-[#ead2d8] transition-colors duration-200"
                      >
                        Logout
                      </button>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-3 text-sm text-[#6b7280] hover:bg-[#f7e7ea] hover:text-[#4a2c2a] border-b border-[#ead2d8] transition-colors duration-200"
                    >
                      My Profile
                    </Link>

                    <Link
                      href="/help"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-3 text-sm text-[#6b7280] hover:bg-[#f7e7ea] hover:text-[#4a2c2a] transition-colors duration-200"
                    >
                      Help & Support
                    </Link>
                  </div>
                )}
              </div>

              {/* WISHLIST */}
              <button
                onClick={() => {
                  if (!user) {
                    alert("Please login first");
                    return;
                  }
                  setLiked(!liked);
                  router.push("/wishlist");
                }}
                className="relative p-2 hover:bg-[#f7e7ea] rounded-lg transition-colors duration-200 group"
              >
                <Heart
                  className={`h-5 w-5 transition-all duration-300 ${
                    liked
                      ? "fill-[#7a1f2b] text-[#7a1f2b]"
                      : "text-[#4a2c2a] group-hover:text-[#7a1f2b]"
                  }`}
                />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-[#7a1f2b] rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* CART */}
              <button
                onClick={() => setBagOpen(true)}
                className="relative p-2 hover:bg-[#f7e7ea] rounded-lg transition-colors duration-200 group"
              >
                <ShoppingBag className="h-5 w-5 text-[#4a2c2a] group-hover:text-[#7a1f2b] transition-colors duration-200" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-[#7a1f2b] rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* MOBILE MENU BUTTON */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden p-2 hover:bg-[#f7e7ea] rounded-lg transition-colors duration-200"
              >
                <Menu className="h-5 w-5 text-[#4a2c2a]" />
              </button>
            </div>
          </div>

          {/* Navigation Menu - DESKTOP ONLY */}
          <div className="hidden md:flex items-center justify-center gap-1 py-3 border-t border-[#ead2d8]/30">
            <Link
              href="/new-arrivals"
              className="px-4 py-2 text-sm font-medium text-[#4a2c2a] hover:text-[#7a1f2b] hover:bg-[#f7e7ea] rounded-lg transition-all duration-200"
            >
              New Arrivals
            </Link>

            <Link
              href="/category"
              className="px-4 py-2 text-sm font-medium text-[#4a2c2a] hover:text-[#7a1f2b] hover:bg-[#f7e7ea] rounded-lg transition-all duration-200"
            >
              Category
            </Link>

            <Link
              href="/shop"
              className="px-4 py-2 text-sm font-medium text-[#4a2c2a] hover:text-[#7a1f2b] hover:bg-[#f7e7ea] rounded-lg transition-all duration-200"
            >
              Shop All
            </Link>

            <Link
              href="/services"
              className="px-4 py-2 text-sm font-medium text-[#4a2c2a] hover:text-[#7a1f2b] hover:bg-[#f7e7ea] rounded-lg transition-all duration-200"
            >
              Services
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] hover:shadow-md rounded-lg transition-all duration-200"
              >
                Admin Panel
              </Link>
            )}

            <Link
              href="/offers"
              className="ml-2 flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#7a1f2b] via-[#d4a373] to-[#7a1f2b] hover:shadow-lg rounded-lg transition-all duration-200 hover:scale-105"
            >
              <Sparkles size={16} />
              Offers
              <Sparkles size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* OVERLAY */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* DRAWER */}
          <div className="absolute left-0 top-0 h-full w-full max-w-xs bg-white shadow-2xl flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-[#ead2d8] px-6 py-5">
              <h2 className="text-lg font-bold text-[#4a2c2a]">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-[#f7e7ea] rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-[#4a2c2a]" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
              {/* Search on Mobile */}
              <div className="mb-6 flex items-center bg-[#fdf8f6] rounded-lg border border-[#ead2d8] px-3 py-2">
                <Search size={16} className="text-[#9c8b87]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none px-2 w-full text-sm text-[#4a2c2a]"
                />
              </div>

              {/* Menu Items */}
              <Link
                href="/shop"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-[#4a2c2a] hover:bg-[#f7e7ea] hover:text-[#7a1f2b] rounded-lg transition-all duration-200"
              >
                Shop All
              </Link>

              <Link
                href="/new-arrivals"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-[#4a2c2a] hover:bg-[#f7e7ea] hover:text-[#7a1f2b] rounded-lg transition-all duration-200"
              >
                New Arrivals
              </Link>

              <Link
                href="/category"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-[#4a2c2a] hover:bg-[#f7e7ea] hover:text-[#7a1f2b] rounded-lg transition-all duration-200"
              >
                Category
              </Link>

              <Link
                href="/services"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-[#4a2c2a] hover:bg-[#f7e7ea] hover:text-[#7a1f2b] rounded-lg transition-all duration-200"
              >
                Services
              </Link>

              <div className="border-t border-[#ead2d8] my-4" />

              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-[#4a2c2a] hover:bg-[#f7e7ea] hover:text-[#7a1f2b] rounded-lg transition-all duration-200"
              >
                My Profile
              </Link>

              <Link
                href="/help"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-[#4a2c2a] hover:bg-[#f7e7ea] hover:text-[#7a1f2b] rounded-lg transition-all duration-200"
              >
                Help & Support
              </Link>

              <div className="border-t border-[#ead2d8] my-4" />

              <Link
                href="/offers"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-[#7a1f2b] via-[#d4a373] to-[#7a1f2b] hover:shadow-lg rounded-lg transition-all duration-200"
              >
                <Sparkles size={18} />
                Offers
                <Sparkles size={18} />
              </Link>
            </div>

            {/* FOOTER */}
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
                className="w-full py-3 px-4 rounded-lg text-white font-bold bg-gradient-to-r from-[#7a1f2b] to-[#5c1721] hover:shadow-lg transition-all duration-200"
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
          {/* OVERLAY */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* DRAWER */}
          <div
            className="absolute left-0 top-0 h-full w-72 bg-white 
                    shadow-xl p-5 flex flex-col justify-between
                    animate-slideIn"
          >
            {/* TOP */}
            <div>
              {/* CLOSE */}
              <div
                onClick={() => setIsMenuOpen(false)}
                className="text-xl cursor-pointer mb-6"
              >
                ✕
              </div>

              {/* MENU */}
              <div className="flex flex-col gap-4 text-[#3e2f2b]">
                <Link
                  href="/shop"
                  className="px-3 py-2 rounded-lg cursor-pointer 
                 hover:bg-[#7a1f2b]/10 hover:text-[#7a1f2b] 
                 transition font-medium"
                >
                  Shop
                </Link>
                <Link
                  href="/new-arrivals"
                  className="px-3 py-2 rounded-lg cursor-pointer 
                 hover:bg-[#7a1f2b]/10 hover:text-[#7a1f2b] 
                 transition font-medium"
                >
                  New Arrival
                </Link>
                <Link
                  href="/category"
                  className="px-3 py-2 rounded-lg cursor-pointer 
                 hover:bg-[#7a1f2b]/10 hover:text-[#7a1f2b] 
                 transition font-medium"
                >
                  Category
                </Link>
                <Link
                  href="/services"
                  className="px-3 py-2 rounded-lg cursor-pointer 
                 hover:bg-[#7a1f2b]/10 hover:text-[#7a1f2b] 
                 transition font-medium"
                >
                  Services
                </Link>
                <div className="border-t my-4"></div>

                <Link
                  href="/profile"
                  className="px-3 py-2 rounded-lg cursor-pointer 
                 hover:bg-[#7a1f2b]/10 hover:text-[#7a1f2b] 
                 transition font-medium"
                >
                  Profile
                </Link>
                <Link
                  href="/help"
                  className="px-3 py-2 rounded-lg cursor-pointer 
                 hover:bg-[#7a1f2b]/10 hover:text-[#7a1f2b] 
                 transition font-medium"
                >
                  Help
                </Link>
                <div className="border-t my-4"></div>
                <div
                  className="relative overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition"
                  onClick={() => (window.location.href = "/offers")}
                >
                  {/* BACKGROUND */}
                  <div
                    className="px-3 py-2 rounded-lg text-white font-semibold
                  bg-gradient-to-r from-[#7a1f2b] via-[#d4a373] to-[#7a1f2b]
                  shadow-md"
                  >
                    Offers 🔥
                  </div>

                  {/* GLITTER EFFECT */}
                  <div
                    className="absolute inset-0 bg-white/20 
                  translate-x-[-100%] 
                  hover:translate-x-[100%] 
                  transition duration-700"
                  ></div>
                </div>
              </div>
            </div>

            {/* BOTTOM */}
            <div>
              <button
                onClick={() => {
                  if (!user) {
                    window.location.href = "/login";
                  } else {
                    localStorage.removeItem("userData");
                    window.dispatchEvent(new Event("userChanged"));
                    window.location.href = "/home";
                  }
                }}
                className="w-full py-3 rounded-xl text-white font-semibold 
             bg-gradient-to-r from-[#7a1f2b] to-[#d4a373] 
             hover:scale-105 transition shadow-md"
              >
                {user ? "Logout" : "Login"}
              </button>
            </div>
          </div>
        </div>
      )}
      <BagDrawer open={bagOpen} setOpen={setBagOpen} />;
    </>
  );
}
