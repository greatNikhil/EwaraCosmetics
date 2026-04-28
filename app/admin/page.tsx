"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Grid2x2,
  LogOut,
  Package,
  Search,
  ShoppingBag,
  Star,
  Tag,
  Users,
} from "lucide-react";
import { buildApiUrl } from "@/utils/api";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { clearClientAuth } from "@/utils/clientAuth";
import AdminProductsPage from "./products/page";
import AdminOrdersPage from "./orders/page";
import AdminCouponsPage from "./coupons/page";
import AdminOffersPage from "./offers/page";
import AdminUsersPage from "./users/page";
import AdminReviewsPage from "./reviews/page";

interface UserSummary {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  createdAt?: string;
}

interface LowStockProduct {
  _id: string;
  name: string;
  slug: string;
  countInStock: number;
  price: number;
  images: string[];
  isPublished: boolean;
}

interface DashboardSummary {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
  recentUsers: UserSummary[];
  lowStockProducts: LowStockProduct[];
  ordersByStatus: Record<string, number>;
}

interface AdminUser {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface GetMeResponse {
  success: boolean;
  user: AdminUser;
}

interface DashboardResponse {
  success: boolean;
  summary: DashboardSummary;
}

export default function AdminPage() {
  const router = useRouter();
  const {
    user: verifiedAdmin,
    token,
    isAuthorized,
    isChecking,
  } = useProtectedRoute({ requireAdmin: true });

  const [products, setProducts] = useState(0);
  const [orders, setOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({});
  const [activeView, setActiveView] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [productsViewMode, setProductsViewMode] = useState<"catalog" | "inventory">("catalog");

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("products")) setActiveView("products");
    else if (path.includes("orders")) setActiveView("orders");
    else if (path.includes("users")) setActiveView("users");
    else if (path.includes("coupons")) setActiveView("coupons");
    else if (path.includes("offers")) setActiveView("offers");
    else if (path.includes("reviews")) setActiveView("reviews");
    else setActiveView("dashboard");
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token || !isAuthorized || !verifiedAdmin) {
        if (!isChecking) {
          setPageLoading(false);
        }
        return;
      }

      try {
        const dashboardRes = await fetch(buildApiUrl("/api/admin/dashboard"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const dashboardData: DashboardResponse = await dashboardRes.json();

        if (dashboardRes.ok && dashboardData.success && dashboardData.summary) {
          setProducts(dashboardData.summary.totalProducts || 0);
          setOrders(dashboardData.summary.totalOrders || 0);
          setTotalUsers(dashboardData.summary.totalUsers || 0);
          setTotalRevenue(dashboardData.summary.totalRevenue || 0);
          setUsers(dashboardData.summary.recentUsers || []);
          setRecentOrders(dashboardData.summary.recentOrders || []);
          setLowStockProducts(dashboardData.summary.lowStockProducts || []);
          setOrdersByStatus(dashboardData.summary.ordersByStatus || {});
        } else {
          setProducts(0);
          setOrders(0);
          setTotalUsers(0);
          setTotalRevenue(0);
          setUsers([]);
          setRecentOrders([]);
          setLowStockProducts([]);
          setOrdersByStatus({});
        }
      } catch (error) {
        console.error("ADMIN DASHBOARD LOAD ERROR:", error);
        clearClientAuth({ dispatchEvent: true });
        router.replace("/login");
      } finally {
        setPageLoading(false);
      }
    };

    loadDashboard();
  }, [isAuthorized, isChecking, router, token, verifiedAdmin]);

  const adminNotifications = useMemo(() => {
    const pendingOrders = (ordersByStatus.Pending || 0) + (ordersByStatus.Processing || 0);
    const notifications = [
      {
        id: "pending-orders",
        title: pendingOrders > 0 ? "Orders need attention" : "Order queue is under control",
        subtitle:
          pendingOrders > 0
            ? `${pendingOrders} orders are pending or processing right now.`
            : "No pending or processing orders need follow-up at the moment.",
        unread: pendingOrders > 0,
        action: () => setActiveView("orders"),
      },
      {
        id: "low-stock",
        title:
          lowStockProducts.length > 0
            ? "Low stock products detected"
            : "Inventory levels look healthy",
        subtitle:
          lowStockProducts.length > 0
            ? `${lowStockProducts.length} products are running low on stock.`
            : "No products are currently flagged for low inventory.",
        unread: lowStockProducts.length > 0,
        action: () => {
          setProductsViewMode("inventory");
          setActiveView("products");
        },
      },
      {
        id: "recent-users",
        title: users.length > 0 ? "New users joined recently" : "No recent user signups",
        subtitle:
          users.length > 0
            ? `${users.length} recent users are visible in your dashboard summary.`
            : "User onboarding activity will appear here when new accounts join.",
        unread: false,
        action: () => setActiveView("users"),
      },
    ];

    return notifications;
  }, [lowStockProducts.length, ordersByStatus.Pending, ordersByStatus.Processing, users.length]);

  const unreadAdminNotifications = adminNotifications.filter((item) => item.unread).length;

  const filteredRecentOrders = useMemo(() => {
    if (!adminSearchTerm.trim()) {
      return recentOrders;
    }

    const normalizedSearch = adminSearchTerm.toLowerCase().trim();

    return recentOrders.filter((order) => {
      const searchableText = [
        order._id,
        order.user?.name,
        order.user?.email,
        order.status,
        String(order.totalAmount ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [adminSearchTerm, recentOrders]);

  const filteredRecentUsers = useMemo(() => {
    if (!adminSearchTerm.trim()) {
      return users;
    }

    const normalizedSearch = adminSearchTerm.toLowerCase().trim();

    return users.filter((user) =>
      [user.name, user.email, user.phone, user.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [adminSearchTerm, users]);

  const filteredLowStockProducts = useMemo(() => {
    if (!adminSearchTerm.trim()) {
      return lowStockProducts;
    }

    const normalizedSearch = adminSearchTerm.toLowerCase().trim();

    return lowStockProducts.filter((product) =>
      [product.name, product.slug, String(product.price), String(product.countInStock)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [adminSearchTerm, lowStockProducts]);

  if (isChecking || pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f0f0]">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#7a1f2b] border-t-transparent" />
          <p className="text-[#7a1f2b]">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!verifiedAdmin || !isAuthorized) return null;

  const handleAdminExit = () => {
    clearClientAuth({ dispatchEvent: true });
    router.push("/");
  };

  const getStatusBadgeStyle = (status: string) => {
    const statusStyles: Record<string, { bg: string; text: string }> = {
      Pending: { bg: "bg-[#faeeda]", text: "text-[#854F0B]" },
      Processing: { bg: "bg-[#e6f1fb]", text: "text-[#185FA5]" },
      Shipped: { bg: "bg-[#ede9fb]", text: "text-[#5B21B6]" },
      Delivered: { bg: "bg-[#eaf3de]", text: "text-[#3B6D11]" },
      Cancelled: { bg: "bg-[#fcebeb]", text: "text-[#a32d2d]" },
    };
    return statusStyles[status] || { bg: "bg-[#f0f0f0]", text: "text-[#7a5060]" };
  };

  const viewTitles: Record<string, string> = {
    dashboard: "Admin Dashboard",
    products: "Products",
    orders: "Orders",
    coupons: "Coupons",
    offers: "Offers",
    users: "Users",
    reviews: "Reviews",
  };

  const navItems = [
    { label: "Dashboard", value: "dashboard", icon: Grid2x2, href: "/admin" },
    { label: "Products", value: "products", icon: ShoppingBag, href: "/admin/products" },
    { label: "Orders", value: "orders", icon: CalendarDays, href: "/admin/orders" },
    { label: "Coupons", value: "coupons", icon: Tag, href: "/admin/coupons" },
    { label: "Offers", value: "offers", icon: Tag, href: "/admin/offers" },
    { label: "Users", value: "users", icon: Users, href: "/admin/users" },
    { label: "Reviews", value: "reviews", icon: Star, href: "/admin/reviews" },
  ];

  const adminInitial = verifiedAdmin.name?.trim()?.charAt(0)?.toUpperCase() || "A";

  const statCards = [
    {
      label: "Total Revenue",
      value: `Rs. ${totalRevenue}`,
      icon: Tag,
      badge: "+12.4%",
      badgeClass: "bg-[#eaf3de] text-[#3B6D11]",
    },
    {
      label: "Total Orders",
      value: orders,
      icon: CalendarDays,
      badge: "+8.1%",
      badgeClass: "bg-[#eaf3de] text-[#3B6D11]",
    },
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      badge: "+4.7%",
      badgeClass: "bg-[#eaf3de] text-[#3B6D11]",
    },
    {
      label: "Total Products",
      value: products,
      icon: Package,
      badge: "-1.2%",
      badgeClass: "bg-[#fcebeb] text-[#a32d2d]",
    },
  ];

  const statusCards = [
    { label: "Pending", dot: "#ef9f27" },
    { label: "Processing", dot: "#185FA5" },
    { label: "Shipped", dot: "#8B5CF6" },
    { label: "Delivered", dot: "#3B6D11" },
    { label: "Cancelled", dot: "#a32d2d" },
  ];

  const renderEmbeddedView = (
    ViewComponent: React.ComponentType<{
      externalSearchTerm?: string;
      inventoryMode?: boolean;
    }>
  ) => (
    <div className="[&>nav]:hidden [&>div]:min-h-0 [&>div]:bg-transparent [&>div]:px-5 [&>div]:py-5 md:[&>div]:px-5 [&>div>div>div:first-child]:mb-0 [&>div>div>div:first-child>div:first-child]:hidden [&>div>div>div:first-child>h1]:hidden [&>div>div>div:first-child>p]:hidden">
      <ViewComponent
        externalSearchTerm={adminSearchTerm}
        inventoryMode={activeView === "products" && productsViewMode === "inventory"}
      />
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside className="sticky top-0 z-10 flex h-screen w-[220px] shrink-0 flex-col overflow-y-auto border-r border-[#f0dde2] border-r-[0.5px] bg-white">
        <div className="border-b border-[#f0dde2] border-b-[0.5px] px-4 pb-4 pt-5">
          <div className="inline-flex rounded-[5px] bg-[#7B2D42] px-[10px] py-1 text-[11px] tracking-[0.1em] text-white">
            EWARA
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[0.06em] text-[#c0a8b0]">
            Admin Panel
          </p>
        </div>

        <div className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    if (item.value === "products") {
                      setProductsViewMode("catalog");
                    }
                    setActiveView(item.value);
                    router.push(item.href);
                  }}
                  className={`flex w-full items-center gap-[10px] px-3 py-[9px] text-left text-[12px] transition ${
                    activeView === item.value
                      ? "rounded-r-[8px] border-l-[3px] border-[#7B2D42] bg-[#f5e8eb] pl-[9px] font-medium text-[#7B2D42]"
                      : "rounded-[8px] text-[#7a5060] hover:bg-[#fdf6f7]"
                  }`}
                >
                  <Icon size={14} strokeWidth={1.8} className="shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#f0dde2] border-t-[0.5px] px-[10px] py-3">
          <button
            onClick={handleAdminExit}
            className="flex items-center gap-2 text-[12px] text-[#b04040]"
          >
            <LogOut size={14} strokeWidth={1.8} />
            Exit Admin
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#f5f0f0]">
        <div className="sticky top-0 z-[5] border-b border-[#f0dde2] border-b-[0.5px] bg-white px-5 py-[10px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex max-w-sm items-center gap-2 rounded-[8px] border border-[#f0dde2] border-[0.5px] bg-[#fdf6f7] px-3 py-2">
              <Search size={14} strokeWidth={1.8} className="text-[#7B2D42]" />
              <input
                type="text"
                value={adminSearchTerm}
                onChange={(event) => setAdminSearchTerm(event.target.value)}
                placeholder={
                  activeView === "dashboard"
                    ? "Search dashboard..."
                    : `Search ${viewTitles[activeView].toLowerCase()}...`
                }
                className="w-full bg-transparent text-[12px] text-[#7a5060] outline-none placeholder:text-[#c0a8b0]"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[#f0dde2] border-[0.5px] bg-[#fdf6f7]"
                >
                  <Bell size={14} strokeWidth={1.8} className="text-[#7B2D42]" />
                  {unreadAdminNotifications > 0 && (
                    <span className="absolute right-[6px] top-[6px] h-[6px] w-[6px] rounded-full bg-[#e24b4a]" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-11 z-20 w-[300px] overflow-hidden rounded-[14px] border border-[#f0dde2] bg-white shadow-[0_18px_40px_rgba(58,26,34,0.08)]">
                    <div className="border-b border-[#f0dde2] px-4 py-3">
                      <p className="text-[12px] font-medium text-[#3a1a22]">
                        Admin Notifications
                      </p>
                      <p className="mt-1 text-[11px] text-[#a48d96]">
                        {unreadAdminNotifications > 0
                          ? `${unreadAdminNotifications} items need attention`
                          : "Everything looks up to date"}
                      </p>
                    </div>

                    <div>
                      {adminNotifications.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            item.action();
                            setShowNotifications(false);
                          }}
                          className={`w-full px-4 py-3 text-left transition hover:bg-[#fdf6f7] ${
                            index !== adminNotifications.length - 1
                              ? "border-b border-[#f0dde2]"
                              : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-1 h-2 w-2 rounded-full ${
                                item.unread ? "bg-[#7B2D42]" : "bg-[#d9c6cc]"
                              }`}
                            />
                            <div>
                              <p className="text-[12px] font-medium text-[#3a1a22]">
                                {item.title}
                              </p>
                              <p className="mt-1 text-[11px] leading-5 text-[#8b7680]">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#7B2D42] text-[11px] text-white">
                {adminInitial}
              </div>

              <button
                onClick={handleAdminExit}
                className="rounded-[6px] border border-[#7B2D42] px-3 py-[5px] text-[11px] text-[#7B2D42]"
              >
                Exit Admin
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-[18px] font-medium text-[#3a1a22]">
                {viewTitles[activeView]}
              </h1>
              <p className="mt-1 text-[11px] text-[#c0a8b0]">
                Manage products, orders, users, and analytics from one place.
              </p>
            </div>

            {activeView === "dashboard" && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-[7px] border border-[#f0dde2] border-[0.5px] bg-white px-3 py-1.5 text-[11px] text-[#7a5060]"
                >
                  <CalendarDays size={12} strokeWidth={1.8} className="text-[#7B2D42]" />
                  Last 30 Days ▾
                </button>
                <button
                  type="button"
                    onClick={() => {
                      setProductsViewMode("catalog");
                      setActiveView("products");
                    }}
                  className="rounded-[7px] bg-[#7B2D42] px-[14px] py-[7px] text-[11px] text-white"
                >
                  Manage Products
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("orders")}
                  className="rounded-[7px] border border-[#7B2D42] px-[14px] py-[7px] text-[11px] text-[#7B2D42]"
                >
                  Manage Orders
                </button>
              </div>
            )}
          </div>
        </div>

        {activeView === "dashboard" && (
          <div className="p-5">
            <div className="mb-[14px] grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-[12px] border border-[#f0dde2] border-[0.5px] bg-white p-[14px]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#fdf6f7]">
                        <Icon size={15} strokeWidth={1.8} className="text-[#7B2D42]" />
                      </div>
                      <span className={`rounded-[10px] px-2 py-[2px] text-[10px] ${card.badgeClass}`}>
                        {card.badge}
                      </span>
                    </div>
                    <p className="mt-5 text-[18px] font-medium text-[#3a1a22]">
                      {card.value}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.04em] text-[#c0a8b0]">
                      {card.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mb-[14px] grid gap-2 md:grid-cols-3 xl:grid-cols-5">
              {statusCards.map((status) => (
                <div
                  key={status.label}
                  className="rounded-[10px] border border-[#f0dde2] border-[0.5px] bg-white px-3 py-[10px] text-center"
                >
                  <span
                    className="mx-auto mb-2 block h-[6px] w-[6px] rounded-full"
                    style={{ backgroundColor: status.dot }}
                  />
                  <p className="text-[16px] font-medium text-[#3a1a22]">
                    {ordersByStatus[status.label] || 0}
                  </p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.04em] text-[#c0a8b0]">
                    {status.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 xl:grid-cols-2">
              <div className="rounded-[12px] border border-[#f0dde2] border-[0.5px] bg-white p-[14px]">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[13px] font-medium text-[#3a1a22]">
                    Recent Orders
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveView("orders")}
                    className="text-[11px] text-[#7B2D42]"
                  >
                    View All →
                  </button>
                </div>

                {filteredRecentOrders.length === 0 ? (
                  <p className="py-5 text-center text-[12px] text-[#c0a8b0]">
                    {adminSearchTerm.trim() ? "No orders match your search." : "No orders found."}
                  </p>
                ) : (
                  <div>
                    {filteredRecentOrders.map((order: any, index: number) => (
                      <div
                        key={order._id}
                        className={`flex items-center gap-[10px] py-2 ${
                          index !== filteredRecentOrders.length - 1
                            ? "border-b border-[#f9f0f2] border-b-[0.5px]"
                            : ""
                        }`}
                      >
                        <p className="w-[70px] text-[11px] font-medium text-[#3a1a22]">
                          {order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="flex-1 truncate text-[11px] text-[#7a5060]">
                          {order.user?.name || "Guest"}
                        </p>
                        <p className="text-[11px] font-medium text-[#3a1a22]">
                          Rs. {order.totalAmount}
                        </p>
                        <span
                          className={`rounded-[10px] px-2 py-[2px] text-[10px] ${getStatusBadgeStyle(order.status).bg} ${getStatusBadgeStyle(order.status).text}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[12px] border border-[#f0dde2] border-[0.5px] bg-white p-[14px]">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[13px] font-medium text-[#3a1a22]">
                    Recent Users
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveView("users")}
                    className="text-[11px] text-[#7B2D42]"
                  >
                    View All →
                  </button>
                </div>

                {filteredRecentUsers.length === 0 ? (
                  <p className="py-5 text-center text-[12px] text-[#c0a8b0]">
                    {adminSearchTerm.trim() ? "No users match your search." : "No users found."}
                  </p>
                ) : (
                  <div>
                    {filteredRecentUsers.slice(0, 5).map((user, index) => (
                      <div
                        key={user._id || index}
                        className={`flex items-center gap-[10px] py-2 ${
                          index !== Math.min(filteredRecentUsers.slice(0, 5).length - 1, 4)
                            ? "border-b border-[#f9f0f2] border-b-[0.5px]"
                            : ""
                        }`}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5e8eb] text-[11px] text-[#7B2D42]">
                          {user.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-medium text-[#3a1a22]">
                            {user.name}
                          </p>
                          <p className="truncate text-[10px] text-[#c0a8b0]">
                            {user.email}
                          </p>
                        </div>
                        <span
                          className={`rounded-[10px] px-2 py-[2px] text-[9px] ${
                            (user.role || "user").toUpperCase() === "ADMIN"
                              ? "bg-[#f5e8eb] text-[#7B2D42]"
                              : "bg-[#f0f0f0] text-[#7a5060]"
                          }`}
                        >
                          {(user.role || "user").toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-[12px] border border-[#f0dde2] border-[0.5px] bg-white p-[14px]">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[13px] font-medium text-[#3a1a22]">
                  Low Stock Products
                </p>
                <button
                  type="button"
                    onClick={() => {
                      setProductsViewMode("inventory");
                      setActiveView("products");
                    }}
                  className="text-[11px] text-[#7B2D42]"
                >
                  Manage Inventory →
                </button>
              </div>

              {filteredLowStockProducts.length === 0 ? (
                <p className="py-5 text-center text-[12px] text-[#c0a8b0]">
                  {adminSearchTerm.trim()
                    ? "No low stock products match your search."
                    : "No low stock products right now"}
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filteredLowStockProducts.map((product) => (
                    <div
                      key={product._id}
                      className="rounded-[10px] border border-[#f0dde2] border-[0.5px] bg-[#fdf6f7] px-3 py-3"
                    >
                      <p className="text-[12px] font-medium text-[#3a1a22]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-[11px] text-[#7a5060]">
                        Stock left: {product.countInStock}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-[#3a1a22]">
                        Rs. {product.price}
                      </p>
                      <p className="mt-2 text-[9px] uppercase tracking-[0.04em] text-[#c0a8b0]">
                        {product.isPublished ? "Published" : "Hidden"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === "products" && renderEmbeddedView(AdminProductsPage)}
        {activeView === "orders" && renderEmbeddedView(AdminOrdersPage)}
        {activeView === "coupons" && renderEmbeddedView(AdminCouponsPage)}
        {activeView === "offers" && renderEmbeddedView(AdminOffersPage)}
        {activeView === "users" && renderEmbeddedView(AdminUsersPage)}
        {activeView === "reviews" && renderEmbeddedView(AdminReviewsPage)}
      </main>
    </div>
  );
}
