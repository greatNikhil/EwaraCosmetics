"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Camera,
  ChevronRight,
  Heart,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Star,
  User,
  X,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import MyAddress from "@/components/profile/MyAddress";
import HelpSupport from "@/components/profile/HelpSupport";
import MyOrders from "@/components/profile/MyOrders";
import Notifications from "@/components/profile/Notifications";
import MyReviews from "@/components/profile/MyReviews";
import MyWishlist from "@/components/profile/MyWishlist";
import { useAuthStore } from "@/store/authStore";
import { buildApiUrl } from "@/utils/api";
import { clearClientAuth, getClientToken } from "@/utils/clientAuth";
import {
  getWishlistItems,
  removeFromWishlist,
  wishlistChangedEvent,
  type WishlistItem,
} from "@/utils/wishlist";
import { addToCart } from "@/utils/cart";
import { showAddedToBagToast } from "@/utils/bagToast";

function ProfilePageContent() {
  const [user, setUser] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const { orders } = useOrders();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const [activeTab, setActiveTab] = useState("overview");
  const [showForm, setShowForm] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
  });
  const [guestMessage, setGuestMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    address: "",
    phone: "",
    pincode: "",
    flat: "",
    city: "",
    state: "",
    default: false,
  });

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const {
    setUser: setAuthUser,
    setToken: setAuthToken,
    setAddresses: setAuthAddresses,
    addresses: authAddresses,
  } = useAuthStore();

  const userKey = user?.email || user?.phone;
  const fullName = `${user?.name || ""} ${user?.lastname || ""}`.trim();
  const defaultAddress = addresses.find((addr) => addr.default) || addresses[0];
  const sortedAddresses = [...addresses].sort(
    (a, b) => Number(b.default) - Number(a.default)
  );
  const validTabs = [
    "overview",
    "profile",
    "address",
    "orders",
    "wishlist",
    "reviews",
    "notifications",
    "helpSupport",
  ];

  const normalizeTab = (value: string | null) => {
    if (value === "support") return "helpSupport";
    return value && validTabs.includes(value) ? value : "overview";
  };

  const navigateToTab = (nextTab: string) => {
    const normalizedTab = normalizeTab(nextTab);

    if (normalizedTab !== activeTab) {
      setActiveTab(normalizedTab);
    }

    const nextUrl =
      normalizedTab === "overview"
        ? "/profile"
        : `/profile?tab=${normalizedTab}`;

    router.push(nextUrl, { scroll: false });
  };

  const fetchAddresses = async (token: string) => {
    const res = await fetch(buildApiUrl("/api/addresses"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch addresses");
    }

    return data.addresses || [];
  };

  const syncUserData = (nextUser: any, nextAddresses: any[] = []) => {
    const selectedAddress =
      nextAddresses.find((addr: any) => addr.default) || nextAddresses[0] || null;

    const mergedUser = {
      ...nextUser,
      id: nextUser?._id || nextUser?.id,
      address: selectedAddress,
    };

    setUser(mergedUser);
    setAuthUser(mergedUser);
    setAddresses(nextAddresses);
    
    // Sync to authStore (no localStorage needed)
    setAuthAddresses(nextAddresses);

    return mergedUser;
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = getClientToken();

      if (!token) {
        clearClientAuth();
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(buildApiUrl("/api/auth/me"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success || !data.user) {
          clearClientAuth();
          router.push("/login");
          return;
        }

        const nextAddresses = await fetchAddresses(token).catch((error) => {
          console.error("PROFILE ADDRESS LOAD ERROR:", error);
          return authAddresses;
        });
        syncUserData(data.user, nextAddresses);
        setAuthToken(token);
      } catch (error) {
        console.error("PROFILE LOAD ERROR:", error);
        clearClientAuth();
        router.push("/login");
      } finally {
        setPageLoading(false);
      }
    };

    const handleUserChanged = () => {
      loadUser();
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === "userData" ||
        event.key === "token" ||
        event.key === null
      ) {
        loadUser();
      }
    };

    loadUser();

    window.addEventListener("userChanged", handleUserChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("userChanged", handleUserChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, [router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    } else {
      setProfileForm({
        name: "",
        lastname: "",
        email: "",
        phone: "",
      });
      setIsEditing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!guestMessage) return;

    const timer = window.setTimeout(() => {
      setGuestMessage(null);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [guestMessage]);

  useEffect(() => {
    const syncWishlist = async () => {
      const items = await getWishlistItems();
      setWishlistItems(Array.isArray(items) ? items : []);
    };

    const handleWishlistChanged = () => {
      syncWishlist();
    };

    syncWishlist();
    window.addEventListener(wishlistChangedEvent, handleWishlistChanged);
    window.addEventListener("storage", handleWishlistChanged);

    return () => {
      window.removeEventListener(wishlistChangedEvent, handleWishlistChanged);
      window.removeEventListener("storage", handleWishlistChanged);
    };
  }, []);

  useEffect(() => {
    const nextTab = normalizeTab(searchParams.get("tab"));

    setActiveTab((currentTab) =>
      currentTab === nextTab ? currentTab : nextTab
    );
  }, [searchParams]);

  const scrollToProfile = () => {
    const section = document.getElementById("profile-section");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  const showGuestPopup = (message = "Please login first") => {
    setGuestMessage(message);
  };

  const saveProfile = async () => {
    if (!user) return;

    const token = getClientToken();

    if (!token) {
      alert("Please login again.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(buildApiUrl("/api/auth/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.user) {
        alert(data.message || "Failed to update profile");
        return;
      }

      syncUserData(data.user, addresses);
      window.dispatchEvent(new Event("userChanged"));
      setIsEditing(false);
    } catch (error) {
      console.error("SAVE PROFILE ERROR:", error);
      alert("Failed to update profile");
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!form.name) newErrors.name = "Please enter first name";
    if (!form.address) newErrors.address = "Please enter address";
    if (!form.phone) newErrors.phone = "Please enter valid mobile number";
    if (!form.pincode) newErrors.pincode = "Please enter pincode";

    if (form.phone && form.phone.length !== 10) {
      newErrors.phone = "Please enter valid mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAddress = async () => {
    if (!validateForm()) return;
    const token = getClientToken();

    if (!token || !user) {
      alert("Please login again.");
      router.push("/login");
      return;
    }

    try {
      const targetAddress = editIndex !== null ? addresses[editIndex] : null;
      const endpoint = targetAddress?._id
        ? buildApiUrl(`/api/addresses/${targetAddress._id}`)
        : buildApiUrl("/api/addresses");
      const method = targetAddress?._id ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to save address");
        return;
      }

      const fallbackAddresses = targetAddress
        ? addresses.map((address, index) => {
            const shouldReplace = index === editIndex;
            const nextDefault = Boolean(data.address?.default);

            if (shouldReplace) {
              return data.address;
            }

            return nextDefault ? { ...address, default: false } : address;
          })
        : [
            ...(data.address?.default
              ? addresses.map((address) => ({ ...address, default: false }))
              : addresses),
            data.address,
          ];

      const nextAddresses = await fetchAddresses(token).catch((error) => {
        console.error("POST-SAVE ADDRESS REFRESH ERROR:", error);
        return fallbackAddresses;
      });
      syncUserData(user, nextAddresses);
      window.dispatchEvent(new Event("userChanged"));

      setShowForm(false);
      setEditIndex(null);
      setOpenMenu(null);
      setErrors({});

      setForm({
        name: "",
        lastname: "",
        address: "",
        phone: "",
        pincode: "",
        flat: "",
        city: "",
        state: "",
        default: false,
      });
    } catch (error) {
      console.error("SAVE ADDRESS ERROR:", error);
      alert("Failed to save address");
    }
  };

  const deleteAddress = async (index: number) => {
    const token = getClientToken();
    const targetAddress = addresses[index];

    if (!token || !targetAddress?._id || !user) return;

    try {
      const res = await fetch(buildApiUrl(`/api/addresses/${targetAddress._id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to delete address");
        return;
      }

      const fallbackAddresses = addresses
        .filter((_, currentIndex) => currentIndex !== index)
        .map((address, currentIndex, remaining) => {
          if (remaining.length === 0) {
            return address;
          }

          const hadDefaultAddress = Boolean(targetAddress.default);
          const hasAnyDefault = remaining.some((item) => item.default);

          if (hadDefaultAddress && !hasAnyDefault && currentIndex === 0) {
            return { ...address, default: true };
          }

          return address;
        });

      const nextAddresses = await fetchAddresses(token).catch((error) => {
        console.error("POST-DELETE ADDRESS REFRESH ERROR:", error);
        return fallbackAddresses;
      });
      syncUserData(user, nextAddresses);
      window.dispatchEvent(new Event("userChanged"));
    } catch (error) {
      console.error("DELETE ADDRESS ERROR:", error);
      alert("Failed to delete address");
    }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf6f7]">
        <p className="text-lg text-[#5a4f4d]">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  const getInitials = () => {
    const initials = [user?.name, user?.lastname]
      .filter(Boolean)
      .map((value: string) => value.trim().charAt(0).toUpperCase())
      .filter(Boolean);

    if (initials.length) return initials.slice(0, 2).join("");

    return String(user?.email || userKey || "U").slice(0, 2).toUpperCase();
  };

  const getAvatarSrc = () => {
    if (!user?.avatar_url) return "";
    return String(user.avatar_url);
  };

  const openAvatarPicker = () => {
    avatarInputRef.current?.click();
  };

  const openAvatarPreview = () => {
    if (!getAvatarSrc()) return;
    setIsAvatarPreviewOpen(true);
  };

  const closeAvatarPreview = () => {
    setIsAvatarPreviewOpen(false);
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !user) return;

    const token = getClientToken();

    if (!token) {
      alert("Please login again.");
      router.push("/login");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsAvatarUploading(true);

      const res = await fetch(buildApiUrl("/api/user/update-avatar"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.avatar_url) {
        alert(data.message || "Failed to update avatar");
        return;
      }

      const nextUser = {
        ...user,
        avatar_url: data.avatar_url,
      };

      syncUserData(nextUser, addresses);
      window.dispatchEvent(new Event("userChanged"));
    } catch (error) {
      console.error("AVATAR UPLOAD ERROR:", error);
      alert("Failed to update avatar");
    } finally {
      event.target.value = "";
      setIsAvatarUploading(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "Not available";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Not available";
    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const profileFields = [
    {
      key: "name",
      label: "First Name",
      value: user?.name,
      icon: User,
      input: (
        <input
          value={profileForm.name}
          className="mt-2 w-full rounded-lg border border-[#f0dde2] bg-white px-3 py-2 text-[13px] font-medium text-[#3f2b33] outline-none transition focus:border-[#7B2D42]"
          onChange={(e) =>
            setProfileForm({
              ...profileForm,
              name: e.target.value,
            })
          }
        />
      ),
    },
    {
      key: "lastname",
      label: "Last Name",
      value: user?.lastname,
      icon: User,
      input: (
        <input
          value={profileForm.lastname}
          className="mt-2 w-full rounded-lg border border-[#f0dde2] bg-white px-3 py-2 text-[13px] font-medium text-[#3f2b33] outline-none transition focus:border-[#7B2D42]"
          onChange={(e) =>
            setProfileForm({
              ...profileForm,
              lastname: e.target.value,
            })
          }
        />
      ),
    },
    {
      key: "phone",
      label: "Phone Number",
      value: user?.phone,
      icon: Phone,
      input: (
        <input
          value={profileForm.phone}
          className="mt-2 w-full rounded-lg border border-[#f0dde2] bg-white px-3 py-2 text-[13px] font-medium text-[#3f2b33] outline-none transition focus:border-[#7B2D42]"
          onChange={(e) =>
            setProfileForm({
              ...profileForm,
              phone: e.target.value.replace(/\D/g, ""),
            })
          }
          maxLength={10}
        />
      ),
    },
    {
      key: "email",
      label: "Email ID",
      value: user?.email,
      icon: Mail,
      input: (
        <input
          value={profileForm.email}
          className="mt-2 w-full rounded-lg border border-[#f0dde2] bg-white px-3 py-2 text-[13px] font-medium text-[#3f2b33] outline-none transition focus:border-[#7B2D42]"
          onChange={(e) =>
            setProfileForm({
              ...profileForm,
              email: e.target.value,
            })
          }
        />
      ),
    },
  ];

  const recentProducts = orders
    .flatMap((order: any) =>
      (order.items || []).map((item: any, index: number) => ({
        id: `${order._id || order.id || "order"}-${item.productId || index}`,
        name: item.productName || item.name || "Product",
        price: item.price ?? order.totalAmount ?? 0,
        image: item.imageUrl || item.image || "",
      }))
    )
    .filter(
      (item: any, index: number, list: any[]) =>
        index === list.findIndex((entry) => entry.name === item.name)
    );

  const reviewCards: any[] = [];
  const reviewsGivenCount = 0;

  const notificationItems = [
    {
      id: 1,
      title: "Your latest order is on the move",
      subtitle: orders[0]
        ? `Order placed on ${formatDate(orders[0].createdAt)} is now being processed.`
        : "Place your first order to start receiving order updates here.",
      unread: true,
    },
    {
      id: 2,
      title: "Profile details up to date",
      subtitle: "Review your saved phone number and email to keep checkout smooth.",
      unread: false,
    },
    {
      id: 3,
      title: "Address book ready",
      subtitle:
        addresses.length > 0
          ? `${addresses.length} saved ${addresses.length === 1 ? "address is" : "addresses are"} available for faster delivery.`
          : "Add an address to speed up checkout on your next order.",
      unread: addresses.length === 0,
    },
  ];

  const supportCards = [
    {
      title: "Chat with us",
      subtitle: "Get quick help with orders, delivery, and account questions.",
      href: "https://wa.me/918545055656",
      external: true,
      icon: MessageCircle,
    },
    {
      title: "Email support",
      subtitle: "Share details and our team can follow up with you directly.",
      href: "mailto:support@ewaraofficial.com",
      external: true,
      icon: Mail,
    },
    {
      title: "FAQs",
      subtitle: "Browse common answers about returns, orders, and payments.",
      href: "/help",
      external: false,
      icon: ChevronRight,
    },
  ];

  const navItems = [
    { key: "overview", label: "Overview", icon: User },
    { key: "address", label: "My Address", icon: MapPin },
    { key: "orders", label: "My Orders", icon: Package },
    { key: "wishlist", label: "My Wishlist", icon: Heart },
    { key: "reviews", label: "My Reviews", icon: Star },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "helpSupport", label: "Help & Support", icon: MessageCircle },
  ];
  const activeSectionLabel =
    activeTab === "profile"
      ? "Profile"
      : navItems.find((item) => item.key === activeTab)?.label || "Overview";

  const getStatusBadgeClass = (status?: string) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "delivered") return "bg-[#eaf3de] text-[#3B6D11]";
    if (normalized === "shipped") return "bg-[#e6f1fb] text-[#185FA5]";
    if (normalized === "processing" || normalized === "pending")
      return "bg-[#faeeda] text-[#854F0B]";
    if (normalized === "cancelled") return "bg-[#fcebeb] text-[#a32d2d]";
    return "bg-[#f5e8eb] text-[#7B2D42]";
  };

  const handleWishlistRemove = async (_id: string) => {
    await removeFromWishlist(_id);
    const items = await getWishlistItems();
    setWishlistItems(items);
  };

  const handleWishlistMoveToCart = async (item: WishlistItem) => {
    try {
      const added = await addToCart({
        _id: item._id,
        name: item.name,
        price: item.price,
        images: [item.image || "/favicon/product.jpeg"],
        category: item.category,
        brand: item.brand,
      });

      if (added) {
        showAddedToBagToast();
      }
    } catch (error) {
      console.error("Failed to move wishlist item to bag:", error);
    }
  };

  return (
    <div className="overflow-x-hidden bg-[#fdf6f7] px-4 py-6 md:px-6">
      <div className="mx-auto w-full max-w-[1200px]">
        {guestMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rotate-1 scale-105 transform rounded-lg bg-[#7B2D42] px-6 py-4 text-white shadow-2xl">
              <p className="text-sm font-medium">{guestMessage}</p>
            </div>
          </div>
        )}

        {isAvatarPreviewOpen && getAvatarSrc() && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-4 py-6"
            onClick={closeAvatarPreview}
          >
            <div
              className="relative w-full max-w-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeAvatarPreview}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/75"
                aria-label="Close profile picture preview"
              >
                <X size={18} strokeWidth={2} />
              </button>
              <img
                src={getAvatarSrc()}
                alt={fullName || "Profile picture"}
                className="max-h-[80vh] w-full rounded-[20px] bg-white object-contain shadow-2xl"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="lg:sticky lg:top-6 lg:w-[280px] lg:flex-shrink-0">
          <div className="flex min-h-full flex-col rounded-[14px] border border-[#f0dde2] bg-white p-4 md:p-6">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <div
              onClick={() => {
                navigateToTab("profile");
                scrollToProfile();
              }}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-xl"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative h-14 w-14 shrink-0">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openAvatarPreview();
                    }}
                    className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#7B2D42] text-base font-semibold text-white transition hover:opacity-85 disabled:cursor-not-allowed"
                    aria-label="View profile picture"
                  >
                    {getAvatarSrc() ? (
                      <img
                        src={getAvatarSrc()}
                        alt={fullName || "Profile picture"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials()
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openAvatarPicker();
                    }}
                    disabled={isAvatarUploading}
                    className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#2f1f25] text-white shadow-sm transition hover:bg-[#1f1519] disabled:cursor-not-allowed"
                    aria-label="Upload profile picture"
                  >
                    <Camera size={12} strokeWidth={2} />
                  </button>
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-[#2f1f25]">
                    {fullName ? `Hey, ${fullName} 👋` : "Hey, User 👋"}
                  </h2>
                  <p className="mt-1 truncate text-sm text-[#8a7780]">
                    {user?.email || user?.phone}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <span className="inline-flex rounded-[20px] bg-[#f5e8eb] px-3 py-1 text-xs font-medium text-[#7B2D42]">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>

            <div className="mt-5 border-t border-[#f0dde2] pt-5">
              <p className="hidden text-[11px] uppercase tracking-[0.06em] text-[#9a8a91] md:block">
                Account
              </p>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 md:block md:space-y-1 md:overflow-visible md:pb-0">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        if (item.key === "address" && !user) {
                          showGuestPopup();
                          return;
                        }
                        navigateToTab(item.key);
                      }}
                      className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-[14px] py-[6px] text-left text-[13px] transition md:w-full md:justify-between md:rounded-[8px] md:px-3 md:py-[11px] ${
                        activeTab === item.key
                          ? "bg-[#7a1a2e] font-semibold text-white md:rounded-r-[8px] md:border-l-[3px] md:border-[#7a1a2e] md:bg-[#fdf0f0] md:pl-[9px] md:text-[#7a1a2e]"
                          : "text-[#444] md:rounded-[8px] md:hover:bg-[#f5e8eb]"
                      }`}
                    >
                      <span className="flex items-center gap-2 md:gap-3">
                        <Icon
                          size={16}
                          className={`${
                            activeTab === item.key
                              ? "text-white md:text-[#7a1a2e]"
                              : "text-[#7B2D42]"
                          }`}
                          strokeWidth={1.8}
                        />
                        <span>{item.label}</span>
                      </span>
                      <ChevronRight
                        size={16}
                        className={`hidden shrink-0 md:block ${
                          activeTab === item.key ? "text-[#7a1a2e]" : "text-[#8f6d78]"
                        }`}
                        strokeWidth={1.8}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 border-t border-[#f0dde2] pt-3">
              <button
                type="button"
                className="flex items-center gap-2 text-xs font-medium text-[#b04040]"
                onClick={() => {
                  clearClientAuth({ dispatchEvent: true });
                  window.location.href = "/login";
                }}
              >
                <LogOut size={15} strokeWidth={1.8} />
                Logout
              </button>
            </div>
          </div>
          </aside>

          <section
            id="profile-section"
            className="min-w-0 flex-1 rounded-[14px] border border-[#f0dde2] bg-white p-6"
          >
            <div className="mb-6 border-b border-[#f0dde2] pb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a8a91]">
                Account
              </p>
              <h1 className="mt-2 text-[22px] font-semibold text-[#2f1f25]">
                {activeSectionLabel}
              </h1>
            </div>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="rounded-[12px] border border-[#f0dde2] bg-[#fdf6f7] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative h-14 w-14 shrink-0">
                      <button
                        type="button"
                        onClick={openAvatarPreview}
                        className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#7B2D42] text-base font-semibold text-white transition hover:opacity-85 disabled:cursor-not-allowed"
                        aria-label="View profile picture"
                      >
                        {getAvatarSrc() ? (
                          <img
                            src={getAvatarSrc()}
                            alt={fullName || "Profile picture"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials()
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={openAvatarPicker}
                        disabled={isAvatarUploading}
                        className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#2f1f25] text-white shadow-sm transition hover:bg-[#1f1519] disabled:cursor-not-allowed"
                        aria-label="Upload profile picture"
                      >
                        <Camera size={12} strokeWidth={2} />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[#2f1f25]">
                        {fullName || "User"}
                      </p>
                      <p className="truncate text-sm text-[#7f6b73]">
                        {user?.email || user?.phone || "Not available"}
                      </p>
                      <p className="mt-1 text-xs text-[#9a8a91]">
                        Member since {formatDate(user?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    { label: "Total Orders", value: orders.length },
                    { label: "Wishlist Items", value: wishlistItems.length },
                    { label: "Reviews Given", value: reviewsGivenCount },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] p-[14px] text-center"
                    >
                      <p className="text-[22px] font-medium text-[#7B2D42]">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.06em] text-[#9a8a91]">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <div className="rounded-[12px] border border-[#f0dde2] bg-white p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-base font-medium text-[#2f1f25]">
                        Recent Orders
                      </h2>
                      {orders.length > 0 && (
                        <button
                          type="button"
                          onClick={() => navigateToTab("orders")}
                          className="text-sm text-[#7B2D42]"
                        >
                          View all
                        </button>
                      )}
                    </div>

                    {orders.length === 0 ? (
                      <div className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] p-4 text-sm text-[#7f6b73]">
                        No orders yet. Your latest purchases will show up here.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 2).map((order: any) => (
                          <Link key={order._id || order.id} href={`/orders/${order._id || order.id}`}>
                            <div className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] px-4 py-3 transition hover:border-[#e4c4cc]">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-[#2f1f25]">
                                    {order.items?.[0]?.productName ||
                                      order.items?.[0]?.name ||
                                      "Order"}
                                  </p>
                                  <p className="mt-1 text-xs text-[#8b7680]">
                                    {formatDate(order.createdAt)} - Rs. 
                                    {Number(order.totalAmount || 0).toFixed(2)}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusBadgeClass(
                                    order.status
                                  )}`}
                                >
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[12px] border border-[#f0dde2] bg-white p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-base font-medium text-[#2f1f25]">
                        Default Address
                      </h2>
                      <button
                        type="button"
                        onClick={() => navigateToTab("address")}
                        className="text-sm text-[#7B2D42]"
                      >
                        Manage
                      </button>
                    </div>

                    {defaultAddress ? (
                      <div className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] p-4 text-sm text-[#6f5b63]">
                        <p className="font-medium text-[#2f1f25]">
                          {defaultAddress.name}
                        </p>
                        <p className="mt-2">{defaultAddress.address}</p>
                        <p>
                          {defaultAddress.city}, {defaultAddress.state}
                        </p>
                        <p>{defaultAddress.pincode}</p>
                        <p className="mt-2">{defaultAddress.phone}</p>
                      </div>
                    ) : (
                      <div className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] p-4 text-sm text-[#7f6b73]">
                        No address added yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h1 className="text-[20px] font-medium text-[#2f1f25]">
                    Profile
                  </h1>
                  <button
                    className="inline-flex w-fit items-center justify-center rounded-[8px] border border-[#7B2D42] px-[18px] py-1.5 text-sm text-[#7B2D42] transition hover:bg-[#7B2D42] hover:text-white"
                    onClick={() => {
                      if (!user) {
                        showGuestPopup();
                        return;
                      }

                      if (isEditing) {
                        saveProfile();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                  >
                    {isEditing ? "Save" : "Edit"}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {profileFields.map((field) => {
                    const Icon = field.icon;
                    const isMissing = !field.value;
                    return (
                      <div
                        key={field.key}
                        className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] px-4 py-3"
                      >
                        <div className="flex items-start gap-3">
                          <Icon size={16} className="mt-0.5 text-[#7B2D42]" strokeWidth={1.8} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-[#a0a0a0]">
                              {field.label}
                            </p>
                            {isEditing ? (
                              field.input
                            ) : (
                              <p
                                className={`mt-1 text-[13px] font-medium ${
                                  isMissing
                                    ? "italic text-[#c0a8b0]"
                                    : "text-[#2f1f25]"
                                }`}
                              >
                                {field.value || "Not provided"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#f0dde2] bg-white px-4 py-2.5 text-sm font-medium text-[#7B2D42]"
                >
                  <Lock size={16} strokeWidth={1.8} />
                  Change Password
                </button>
              </div>
            )}

            {activeTab === "address" && (
              <MyAddress
                showForm={showForm}
                setShowForm={setShowForm}
                user={user}
                showGuestPopup={showGuestPopup}
                addresses={addresses}
                sortedAddresses={sortedAddresses}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                setForm={setForm}
                form={form}
                errors={errors}
                setErrors={setErrors}
                setEditIndex={setEditIndex}
                deleteAddress={deleteAddress}
                saveAddress={saveAddress}
              />
            )}

            {activeTab === "orders" && (
              <MyOrders
                orders={orders}
                formatDate={formatDate}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            )}

            {activeTab === "wishlist" && (
              <MyWishlist
                wishlistItems={wishlistItems}
                handleWishlistRemove={handleWishlistRemove}
                handleWishlistMoveToCart={handleWishlistMoveToCart}
              />
            )}

            {activeTab === "reviews" && (
              <MyReviews reviewCards={reviewCards} formatDate={formatDate} />
            )}

            {activeTab === "notifications" && (
              <Notifications notificationItems={notificationItems} />
            )}

            {activeTab === "helpSupport" && (
              <HelpSupport supportCards={supportCards} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fdf6f7]">
          <p className="text-lg text-[#5a4f4d]">Loading profile...</p>
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
