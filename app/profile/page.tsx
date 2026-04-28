"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
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
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useAuthStore } from "@/store/authStore";
import { buildApiUrl } from "@/utils/api";
import { clearClientAuth } from "@/utils/clientAuth";
import {
  getWishlistItems,
  removeFromWishlist,
  wishlistChangedEvent,
  type WishlistItem,
} from "@/utils/wishlist";
import { addToCart } from "@/utils/cart";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const { orders } = useOrders();
  const router = useRouter();
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
  const [errors, setErrors] = useState<any>({});
  const {
    setUser: setAuthUser,
    setToken: setAuthToken,
    setAddresses: setAuthAddresses,
    addresses: authAddresses,
  } = useAuthStore();

  const userKey = user?.email || user?.phone;
  const defaultAddress = addresses.find((addr) => addr.default) || addresses[0];
  const sortedAddresses = [...addresses].sort(
    (a, b) => Number(b.default) - Number(a.default)
  );

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
    
    // ✅ Sync to authStore (no localStorage needed)
    setAuthAddresses(nextAddresses);

    return mergedUser;
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

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
      setWishlistItems(items);
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

  const scrollToProfile = () => {
    const section = document.getElementById("profile-section");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  const showGuestPopup = (message = "Please login first") => {
    setGuestMessage(message);
  };

  const saveProfile = async () => {
    if (!user) return;

    const token = localStorage.getItem("token");

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
    const token = localStorage.getItem("token");

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
    const token = localStorage.getItem("token");
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
      href: "mailto:info@ewaraofficial.com",
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
    { key: "support", label: "Help & Support", icon: MessageCircle },
  ];

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

  const handleWishlistMoveToCart = (item: WishlistItem) => {
    addToCart({
      _id: item._id,
      name: item.name,
      price: item.price,
      images: [item.image || "/favicon/product.jpeg"],
      category: item.category,
      brand: item.brand,
    });
  };

  return (
    <div className="overflow-x-hidden bg-[#fdf6f7] px-4 py-6 md:px-6">
      <div className="mx-auto w-full max-w-7xl">
        {guestMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rotate-1 scale-105 transform rounded-lg bg-[#7B2D42] px-6 py-4 text-white shadow-2xl">
              <p className="text-sm font-medium">{guestMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="flex min-h-full flex-col rounded-[14px] border border-[#f0dde2] bg-white p-6">
            <div
              onClick={() => {
                setActiveTab("profile");
                scrollToProfile();
              }}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-xl"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#7B2D42] text-base font-semibold text-white">
                  {getInitials()}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-[#2f1f25]">
                    Hey, User 👋
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
              <p className="text-[11px] uppercase tracking-[0.06em] text-[#9a8a91]">
                Account
              </p>

              <div className="mt-4 space-y-1">
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
                        setActiveTab(item.key);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-[11px] text-left text-[13px] transition ${
                        activeTab === item.key
                          ? "rounded-r-[8px] border-l-[3px] border-[#7B2D42] bg-[#f5e8eb] pl-[9px] text-[#2f1f25]"
                          : "rounded-[8px] text-[#56444b] hover:bg-[#f5e8eb]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={16} className="text-[#7B2D42]" strokeWidth={1.8} />
                        <span>{item.label}</span>
                      </span>
                      <ChevronRight
                        size={16}
                        className="shrink-0 text-[#8f6d78]"
                        strokeWidth={1.8}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto border-t border-[#f0dde2] pt-3">
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
          </aside>

          <section
            id="profile-section"
            className="min-h-fit rounded-[14px] border border-[#f0dde2] bg-white p-6"
          >
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="rounded-[12px] border border-[#f0dde2] bg-[#fdf6f7] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#7B2D42] text-base font-semibold text-white">
                      {getInitials()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[#2f1f25]">
                        {`${user?.name || "User"} ${user?.lastname || ""}`.trim()}
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
                          onClick={() => setActiveTab("orders")}
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
                                    {formatDate(order.createdAt)} • ₹
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
                        onClick={() => setActiveTab("address")}
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
              <div>
                <div className="mb-6 flex items-center gap-3">
                  {showForm && (
                    <button
                      type="button"
                      className="rounded-full border border-[#f0dde2] p-1 text-[#7B2D42]"
                      onClick={() => {
                        setShowForm(false);
                        setEditIndex(null);
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
                      }}
                    >
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </button>
                  )}

                  <h2 className="text-[20px] font-medium text-[#2f1f25]">
                    {showForm ? "Add New Address" : "My Address"}
                  </h2>
                </div>

                {addresses.length === 0 && !showForm && (
                  <div className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] p-5 text-center">
                    <p className="text-base font-medium text-[#2f1f25]">
                      No addresses found
                    </p>
                    <button
                      onClick={() => {
                        if (!user) {
                          showGuestPopup();
                          return;
                        }
                        setShowForm(true);
                      }}
                      className="mt-4 inline-flex rounded-[10px] border border-dashed border-[#c0a8b0] px-5 py-3 text-sm text-[#7B2D42]"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {addresses.length > 0 && !showForm && (
                  <div className="space-y-4">
                    {sortedAddresses.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-sm text-[#6f5b63]">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-[#2f1f25]">
                                {item.name} {item.lastname || ""}
                              </p>
                              {item.default && (
                                <span className="rounded-full bg-[#f5e8eb] px-2.5 py-1 text-[11px] text-[#7B2D42]">
                                  Default
                                </span>
                              )}
                            </div>
                            {item.flat && <p className="mt-2">{item.flat}</p>}
                            <p className={item.flat ? "" : "mt-2"}>{item.address}</p>
                            <p>
                              {item.city}, {item.state} {item.pincode}
                            </p>
                            <p className="mt-2">{item.phone}</p>
                          </div>
                          <div className="relative">
                            <img
                              src="/favicon/dots.svg"
                              className="h-5 w-5 cursor-pointer"
                              onClick={() =>
                                setOpenMenu(openMenu === index ? null : index)
                              }
                            />

                            {openMenu === index && (
                              <div className="absolute right-0 z-10 mt-2 w-32 overflow-hidden rounded-lg border border-[#f0dde2] bg-white shadow-md">
                                <div
                                  onClick={() => {
                                    const selected = sortedAddresses[index];

                                    setForm({
                                      name: selected.name || "",
                                      lastname: selected.lastname || "",
                                      address: selected.address || "",
                                      phone: selected.phone || "",
                                      pincode: selected.pincode || "",
                                      flat: selected.flat || "",
                                      city: selected.city || "",
                                      state: selected.state || "",
                                      default: selected.default || false,
                                    });

                                    const actualIndex = addresses.findIndex(
                                      (addr) =>
                                        (selected._id && addr._id === selected._id) ||
                                        (!selected._id &&
                                          addr.address === selected.address &&
                                          addr.phone === selected.phone &&
                                          addr.pincode === selected.pincode)
                                    );

                                    setEditIndex(actualIndex);
                                    setShowForm(true);
                                    setOpenMenu(null);
                                  }}
                                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[#56444b] hover:bg-[#fdf6f7]"
                                >
                                  <img src="/favicon/edit.svg" className="h-5 w-5" />
                                  <span>Edit</span>
                                </div>

                                <div
                                  onClick={() => {
                                    const selected = sortedAddresses[index];
                                    const actualIndex = addresses.findIndex(
                                      (addr) =>
                                        (selected._id && addr._id === selected._id) ||
                                        (!selected._id &&
                                          addr.address === selected.address &&
                                          addr.phone === selected.phone &&
                                          addr.pincode === selected.pincode)
                                    );
                                    deleteAddress(actualIndex);
                                    setOpenMenu(null);
                                  }}
                                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[#b04040] hover:bg-[#fff6f6]"
                                >
                                  <img
                                    src="/favicon/delete.svg"
                                    className="h-5 w-5 scale-110"
                                  />
                                  <span>Delete</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          showGuestPopup();
                          return;
                        }
                        setShowForm(true);
                        setEditIndex(null);
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
                      }}
                      className="w-full rounded-[10px] border border-dashed border-[#c0a8b0] px-4 py-[14px] text-center text-[13px] text-[#7B2D42]"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {showForm && (
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="text-sm font-medium text-[#5a4f4d]">
                        PIN Code *
                      </label>
                      <input
                        value={form.pincode}
                        placeholder="Eg: 110001"
                        className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#fdf6f7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:border-[#7B2D42]"
                        onChange={async (e) => {
                          const pin = e.target.value.replace(/\D/g, "");
                          setForm((prev) => ({ ...prev, pincode: pin }));

                          if (pin.length === 6) {
                            try {
                              const res = await fetch(
                                `https://api.postalpincode.in/pincode/${pin}`
                              );
                              const data = await res.json();

                              if (data[0].Status === "Success") {
                                const post = data[0].PostOffice[0];

                                setForm((prev) => ({
                                  ...prev,
                                  pincode: pin,
                                  city: post.District,
                                  state: post.State,
                                }));
                              }
                            } catch {
                              console.error("Error fetching pincode");
                            }
                          }
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-[#5a4f4d]">
                          City
                        </label>
                        <input
                          value={form.city}
                          disabled
                          className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#f4edef] p-3"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-[#5a4f4d]">
                          State
                        </label>
                        <input
                          value={form.state}
                          disabled
                          className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#f4edef] p-3"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#5a4f4d]">
                        Flat / Building No (Optional)
                      </label>
                      <input
                        value={form.flat}
                        placeholder="Eg: A1, Block D"
                        className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#fdf6f7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:border-[#7B2D42]"
                        onChange={(e) =>
                          setForm({ ...form, flat: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#5a4f4d]">
                        Complete Address *
                      </label>
                      <input
                        value={form.address}
                        placeholder="Eg: Plot no. 401"
                        className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#fdf6f7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:border-[#7B2D42]"
                        onChange={(e) => {
                          setForm({ ...form, address: e.target.value });

                          if (errors.address) {
                            setErrors({ ...errors, address: "" });
                          }
                        }}
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-[#5a4f4d]">
                          First Name *
                        </label>
                        <input
                          value={form.name}
                          placeholder="Eg: Om"
                          className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#fdf6f7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:border-[#7B2D42]"
                          onChange={(e) => {
                            setForm({ ...form, name: e.target.value });

                            if (errors.name) {
                              setErrors({ ...errors, name: "" });
                            }
                          }}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-[#5a4f4d]">
                          Last Name (Optional)
                        </label>
                        <input
                          value={form.lastname}
                          placeholder="Eg: Sharma"
                          className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#fdf6f7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:border-[#7B2D42]"
                          onChange={(e) =>
                            setForm({ ...form, lastname: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#5a4f4d]">
                        Mobile Number *
                      </label>
                      <input
                        value={form.phone}
                        maxLength={10}
                        placeholder="Eg: 9876543210"
                        className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#fdf6f7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:border-[#7B2D42]"
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setForm({ ...form, phone: value });

                          if (errors.phone) {
                            setErrors({ ...errors, phone: "" });
                          }
                        }}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.default}
                        onChange={(e) =>
                          setForm({ ...form, default: e.target.checked })
                        }
                      />
                      <span className="text-sm text-[#5a4f4d]">
                        Set as my default address
                      </span>
                    </div>

                    <button
                      onClick={saveAddress}
                      className="mt-2 rounded-[10px] bg-[#7B2D42] py-3 text-white transition hover:opacity-90"
                    >
                      Save Address
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h2 className="mb-6 text-[20px] font-medium text-[#2f1f25]">
                  My Orders
                </h2>

                {orders.length === 0 ? (
                  <div className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] py-12 text-center">
                    <p className="text-lg font-medium text-[#2f1f25]">
                      No orders yet
                    </p>
                    <p className="mt-2 text-sm text-[#7a6f6b]">
                      Start shopping to see your orders here.
                    </p>
                    <Link
                      href="/shop"
                      className="mt-6 inline-block rounded-lg bg-[#7B2D42] px-6 py-3 font-semibold text-white transition hover:shadow-md"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <Link key={order._id || order.id} href={`/orders/${order._id || order.id}`}>
                        <div className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] px-4 py-3 transition hover:border-[#e4c4cc]">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#2f1f25]">
                                Order #{String(order._id || order.id).slice(-6)}
                              </p>
                              <p className="mt-1 truncate text-sm text-[#6f5b63]">
                                {order.items
                                  ?.map((item: any) => item.productName || item.name)
                                  .filter(Boolean)
                                  .join(", ") || "Items unavailable"}
                              </p>
                              <p className="mt-1 text-xs text-[#8b7680]">
                                {formatDate(order.createdAt)} • ₹
                                {Number(order.totalAmount || 0).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-medium ${getStatusBadgeClass(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                              <ChevronRight
                                size={16}
                                className="text-[#8f6d78]"
                                strokeWidth={1.8}
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <h2 className="mb-6 text-[20px] font-medium text-[#2f1f25]">
                  My Wishlist
                </h2>

                {wishlistItems.length === 0 ? (
                  <div className="rounded-[12px] border border-[#f0dde2] bg-[#fdf6f7] p-6 text-sm text-[#7f6b73]">
                    <p>No wishlist items yet.</p>
                    <Link
                      href="/wishlist"
                      className="mt-4 inline-flex rounded-[8px] border border-[#7B2D42] px-3 py-2 text-xs font-medium text-[#7B2D42] transition hover:bg-[#7B2D42] hover:text-white"
                    >
                      Open Wishlist Page
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {wishlistItems.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-[12px] border border-[#f0dde2] bg-white p-3"
                      >
                        <div className="mb-3 flex items-start gap-3">
                          <div className="flex h-24 flex-1 items-center justify-center rounded-[10px] bg-[#fdf6f7]">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full rounded-[10px] object-cover"
                              />
                            ) : (
                              <Package size={28} className="text-[#c0a8b0]" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleWishlistRemove(item._id)}
                            className="shrink-0 rounded-full border border-[#f0dde2] p-2 text-[#7B2D42]"
                          >
                            <Heart size={14} fill="currentColor" />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-[#2f1f25]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm text-[#7B2D42]">
                          ₹{Number(item.price || 0).toFixed(2)}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleWishlistMoveToCart(item)}
                          className="mt-3 rounded-[8px] border border-[#7B2D42] px-3 py-1.5 text-xs font-medium text-[#7B2D42] transition hover:bg-[#7B2D42] hover:text-white"
                        >
                          Move to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h2 className="mb-6 text-[20px] font-medium text-[#2f1f25]">
                  My Reviews
                </h2>

                {reviewCards.length === 0 ? (
                  <div className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] p-6 text-sm text-[#7f6b73]">
                    <p className="text-sm text-[#2f1f25]">
                      Review history is not synced to the profile yet.
                    </p>
                    <p className="mt-2 leading-6">
                      You can still leave reviews from eligible product pages after
                      purchase.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href="/orders"
                        className="rounded-[8px] border border-[#7B2D42] px-3 py-2 text-xs font-medium text-[#7B2D42] transition hover:bg-[#7B2D42] hover:text-white"
                      >
                        View Orders
                      </Link>
                      <Link
                        href="/shop"
                        className="rounded-[8px] bg-[#7B2D42] px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
                      >
                        Browse Products
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewCards.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] p-[14px]"
                      >
                        <p className="text-sm font-medium text-[#2f1f25]">
                          {review.name}
                        </p>
                        <div className="mt-2 flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              size={15}
                              className="text-[#7B2D42]"
                              fill={index < review.rating ? "#7B2D42" : "none"}
                              strokeWidth={1.8}
                            />
                          ))}
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#6f5b63]">
                          {review.text}
                        </p>
                        <p className="mt-3 text-xs text-[#9a8a91]">
                          {formatDate(review.date)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <h2 className="mb-6 text-[20px] font-medium text-[#2f1f25]">
                  Notifications
                </h2>

                <div className="overflow-hidden rounded-[10px] border border-[#f0dde2]">
                  {notificationItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 px-4 py-3 ${
                        item.unread
                          ? "bg-[#fdf6f7] font-medium"
                          : "bg-white text-[#8a7780]"
                      } ${index !== notificationItems.length - 1 ? "border-b border-[#f0dde2]" : ""}`}
                    >
                      <span
                        className={`mt-1 h-2 w-2 rounded-full ${
                          item.unread ? "bg-[#7B2D42]" : "bg-transparent"
                        }`}
                      />
                      <div>
                        <p className="text-sm text-[#2f1f25]">{item.title}</p>
                        <p className="mt-1 text-sm text-[#7f6b73]">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "support" && (
              <div>
                <h2 className="mb-6 text-[20px] font-medium text-[#2f1f25]">
                  Help & Support
                </h2>

                <div className="space-y-4">
                  {supportCards.map((card) => (
                    <Link
                      key={card.title}
                      href={card.href}
                      target={card.external ? "_blank" : undefined}
                      rel={card.external ? "noreferrer" : undefined}
                      className="flex items-center justify-between rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] px-4 py-[14px]"
                    >
                      <div className="flex items-center gap-3">
                        <card.icon
                          size={18}
                          className="text-[#7B2D42]"
                          strokeWidth={1.8}
                        />
                        <div>
                          <p className="text-sm font-medium text-[#2f1f25]">
                            {card.title}
                          </p>
                          <p className="text-sm text-[#7f6b73]">
                            {card.subtitle}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-[#8f6d78]"
                        strokeWidth={1.8}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
