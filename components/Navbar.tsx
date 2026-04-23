"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Search, LogOut, Settings } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Heart, ShoppingBag, User } from "lucide-react";
import { useRouter } from "next/navigation";
import BagDrawer from "@/components/BagDrawer";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export function Navbar() {
  const [bagOpen, setBagOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const router = useRouter();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, logout } = useAuthStore();
  const { items: cartItems, getTotalItems } = useCartStore();
  const [isAdmin, setIsAdmin] = useState(false);

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
      if (storedUser) setUser(storedUser);
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
      {/* 🔥 TOP OFFER STRIP */}
      <div className="overflow-hidden whitespace-nowrap  bg-gradient-to-r from-[#f7e7ea]/70 via-[#f3ede7]/70 to-[#e8d5c4]/70 backdrop-blur-md border-b border-white/30">
        <div className="animate-marquee inline-block px-4 py-2 text-sm text-[#4a2c2a]">
          ✨ First Order: Get Extra 10% Off on ₹700+ ✦✦ &nbsp;&nbsp;&nbsp; ✨ Up
          to 50% Off + Surprise Gifts ✨ &nbsp;&nbsp;&nbsp; ✨ Free Shipping on
          Orders Above ₹999 ✨&nbsp;&nbsp;&nbsp;✨ First Order: Get Extra 10%
          Off on ₹700+ ✨ &nbsp;&nbsp;&nbsp; ✨ Up to 50% Off + Surprise Gifts
          ✨ &nbsp;&nbsp;&nbsp; ✨ Free Shipping on Orders Above ₹999 ✨
        </div>
      </div>
      {/* 🔥 MAIN NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#f7e7ea]/80 backdrop-blur-md border-b border-[#ead2d8] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          {/* LOGO */}
          <div
            className="flex items-center p-2 rounded-lg  
                            shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
          >
            <img
              src="/favicon/logo.png"
              alt="logo"
              onClick={() => (window.location.href = "/")}
              className="h-8 md:h-10 w-auto cursor-pointer object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)] 
                        hover:drop-shadow-[0_8px_14px_rgba(0,0,0,0.4)] 
                        transition"
            />
          </div>

          {/* 🔍 SEARCH BAR */}
          <div className="hidden md:flex items-center w-[40%] bg-[#f3ede7] rounded-full px-4 py-2 border border-[#e6dcd2]  hover:scale-110 transition duration-200">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search for products..."
              className="bg-transparent outline-none px-3 w-full text-sm text-[#4a2c2a]"
            />
          </div>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-4 ml-6 text-[#4a2c2a] ">
            {/* PROFILE */}
            <div className="relative hidden md:block hover:scale-110 transition duration-200">
              <img
                src="/favicon/profile.svg"
                alt="profile"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-6 h-6 cursor-pointer transition duration-300 hover:bg-grey-500 hover:scale-100"
              />
              {/* DROPDOWN */}
              {isProfileOpen && (
                <div
                  className={`absolute right-0 top-full mt-2 w-44 rounded-xl 
                  bg-[#f7e7ea] border border-black 
                  shadow-md backdrop-blur-md 
                  transition-all duration-300
                  ${isProfileOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}
                  ref={profileRef}
                >
                  {/* 🔐 LOGIN / LOGOUT SWITCH */}
                  {!user ? (
                    <Link
                      href="/login"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-[#5a4f4d] 
    hover:bg-[#5c1721] hover:text-white transition rounded-t-xl"
                    >
                      Login
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        // 🔥 Remove EVERYTHING related to auth
                        localStorage.removeItem("token");
                        localStorage.removeItem("userData");
                        localStorage.removeItem("isLoggedIn");
                        localStorage.removeItem("isAdmin");

                        window.dispatchEvent(new Event("userChanged"));

                        setUser(null);
                        setIsMenuOpen(false);

                        // 🔥 Redirect to login
                        window.location.href = "/login";
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#5a4f4d] 
    hover:bg-[#5c1721] hover:text-white transition rounded-t-xl"
                    >
                      Logout
                    </button>
                  )}

                  {/* 👤 PROFILE (always visible) */}
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-4 py-2 text-sm text-[#5a4f4d] 
                  hover:bg-[#5c1721] hover:text-white transition"
                  >
                    Profile
                  </Link>

                  {/* ❓ HELP (always visible) */}
                  <Link
                    href="/help"
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-4 py-2 text-sm text-[#5a4f4d] 
                  hover:bg-[#5c1721] hover:text-white transition rounded-b-xl"
                  >
                    Help
                  </Link>
                </div>
              )}
            </div>

            {/* ❤️ WISHLIST */}
            <div className="relative hover:scale-110 transition duration-200">
              <img
                src="/favicon/heart.svg"
                onClick={() => {
                  if (!user) {
                    alert("Please login first");
                    return;
                  }

                  setLiked(!liked);
                  router.push("/wishlist"); // 🔥 navigation control
                }}
                className={`w-6 h-6 cursor-pointer transition-all duration-300
      ${liked
                    ? "scale-125 animate-pulse brightness-0 sepia saturate-[600%] hue-rotate-[310deg]"
                    : "scale-100"
                  }
      hover:scale-110 active:scale-90`}
              />

              {/* COUNT */}
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#7a1f2b] text-white text-xs px-1.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </div>

            {/* 🛍 BAG */}
            <ShoppingBag
              size={20}
              className="cursor-pointer text-black transition duration-300 hover:text-blue-500 hover:scale-110"
              onClick={() => setBagOpen(true)}
            />
            <div className="md:hidden">
              <div
                onClick={() => setIsMenuOpen(true)}
                className="text-2xl cursor-pointer"
              >
                ☰
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 MENU BAR */}
        <div className=" hidden md:flex justify-center gap-5  md:gap-6 py-3 text-sm text-[#5a4f4d]">
          {/* NEW ARRIVALS */}
          <Link
            href="/new-arrivals"
            className="px-3 py-1.5 rounded-full transition duration-300 
             text-[#5a4f4d] 
             hover:bg-[#5c1721] hover:text-white"
          >
            New Arrivals
          </Link>
          {/* OTHER LINKS */}
          <Link
            href="/category"
            className="cursor-pointer px-2 py-1 rounded-full 
                   hover:bg-[#5c1721] hover:text-white 
                   transition"
          >
            Category
          </Link>
          <Link
            href="/shop"
            className="cursor-pointer px-2 py-1 rounded-full 
                   hover:bg-[#5c1721] hover:text-white
                   transition"
          >
            Shop
          </Link>
          <Link
            href="/services"
            className="cursor-pointer px-2 py-1 rounded-full 
                  hover:bg-[#5c1721] hover:text-white 
                   transition"
          >
            Services
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="cursor-pointer px-2 py-1 rounded-full 
                  hover:bg-[#5c1721] hover:text-white 
                   transition font-semibold text-[#7a1f2b]"
            >
              Admin
            </Link>
          )}
          <Link
            href="/offers"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full 
             bg-gradient-to-r from-blue-500 to-indigo-500 
             text-white font-medium text-sm 
             shadow-md hover:shadow-lg 
             transition duration-300 hover:scale-105"
          >
            <Sparkles size={14} className="text-white" />
            Offers
            <Sparkles size={14} className="text-white" />
          </Link>
        </div>
      </header>
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
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
