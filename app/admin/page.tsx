"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";

interface UserSummary {
  name: string;
  email: string;
  phone: string;
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

export default function AdminPage() {
  const router = useRouter();

  const [products, setProducts] = useState(0);
  const [orders, setOrders] = useState(0);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.removeItem("userData");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isAdmin");
        router.push("/login");
        return;
      }

      try {
        // 1. verify admin
        const userRes = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData: GetMeResponse = await userRes.json();

        if (!userRes.ok || !userData.success || !userData.user) {
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("isAdmin");
          router.push("/login");
          return;
        }

        if (userData.user.role !== "admin") {
          alert("Access denied. Admins only.");
          router.push("/");
          return;
        }

        setAdminUser(userData.user);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("userData", JSON.stringify(userData.user));

        // 2. fetch products count from backend
        const productRes = await fetch("http://localhost:5000/api/products");
        const productData = await productRes.json();

        if (productRes.ok && productData.success) {
          setProducts(productData.totalProducts || productData.count || 0);
        } else {
          setProducts(0);
        }

        // 3. fetch orders count from backend
        const orderRes = await fetch("http://localhost:5000/api/orders", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const orderData = await orderRes.json();

        if (orderRes.ok && orderData.success) {
          setOrders(orderData.count || 0);
        } else {
          setOrders(0);
        }

        // 4. fetch recent orders for dashboard
        try {
          const recentOrderRes = await fetch("http://localhost:5000/api/orders", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const recentOrderData = await recentOrderRes.json();

          if (recentOrderRes.ok && recentOrderData.success) {
            // Sort by date descending and take first 5
            const sorted = (recentOrderData.orders || [])
              .sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
              .slice(0, 5);
            
            setRecentOrders(sorted);
          } else {
            setRecentOrders([]);
          }
        } catch (error) {
          console.error("FETCH RECENT ORDERS ERROR:", error);
          setRecentOrders([]);
        }

        // 5. users summary from localStorage fallback
        const storedUsers = localStorage.getItem("users");
        let parsedUsers: UserSummary[] = [];

        if (storedUsers) {
          try {
            parsedUsers = JSON.parse(storedUsers);
          } catch {
            parsedUsers = [];
          }
        }

        if (parsedUsers.length === 0) {
          parsedUsers = [
            {
              name: userData.user.name || "Admin",
              email: userData.user.email || "not-set@example.com",
              phone: userData.user.phone || "-",
            },
          ];
        }

        setUsers(parsedUsers);
      } catch (error) {
        console.error("ADMIN AUTH ERROR:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isAdmin");
        router.push("/login");
      } finally {
        setPageLoading(false);
      }
    };

    verifyAdmin();
  }, [router]);

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf8f6]">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#7a1f2b] border-t-transparent" />
          <p className="text-[#7a1f2b]">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) return null;

  const getStatusBadgeStyle = (status: string) => {
    const statusStyles: Record<string, { bg: string; text: string }> = {
      "Pending": { bg: "bg-yellow-100", text: "text-yellow-800" },
      "Processing": { bg: "bg-blue-100", text: "text-blue-800" },
      "Shipped": { bg: "bg-purple-100", text: "text-purple-800" },
      "Delivered": { bg: "bg-green-100", text: "text-green-800" },
      "Cancelled": { bg: "bg-red-100", text: "text-red-800" },
    };
    return statusStyles[status] || { bg: "bg-gray-100", text: "text-gray-800" };
  };

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#4a2c2a]">
                Admin Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-[#5e3339]">
                Manage products, orders, and users from the admin control panel.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/products"
                className="rounded-full bg-[#7a1f2b] px-6 py-3 font-semibold text-white shadow-lg shadow-[#7a1f2b]/20 transition hover:bg-[#8d2742]"
              >
                Manage Products
              </Link>
              <Link
                href="/admin/orders"
                className="rounded-full border border-[#7a1f2b] px-6 py-3 font-semibold text-[#7a1f2b] transition hover:bg-[#f7e7ea]"
              >
                Manage Orders
              </Link>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-[#ead2d8] bg-white p-8 shadow-sm transition hover:shadow-lg">
              <p className="text-sm uppercase tracking-[0.24em] text-[#7a1f2b]/70">
                Total Products
              </p>
              <p className="mt-4 text-4xl font-bold text-[#4a2c2a]">
                {products}
              </p>
              <p className="mt-2 text-sm text-[#6b7280]">
                Products available in store and admin panel.
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead2d8] bg-white p-8 shadow-sm transition hover:shadow-lg">
              <p className="text-sm uppercase tracking-[0.24em] text-[#7a1f2b]/70">
                Total Orders
              </p>
              <p className="mt-4 text-4xl font-bold text-[#4a2c2a]">
                {orders}
              </p>
              <p className="mt-2 text-sm text-[#6b7280]">
                Orders tracked from real backend order data.
              </p>
            </div>

            <div className="rounded-3xl border border-[#ead2d8] bg-white p-8 shadow-sm transition hover:shadow-lg">
              <p className="text-sm uppercase tracking-[0.24em] text-[#7a1f2b]/70">
                Total Users
              </p>
              <p className="mt-4 text-4xl font-bold text-[#4a2c2a]">
                {users.length}
              </p>
              <p className="mt-2 text-sm text-[#6b7280]">
                Basic user count loaded from localStorage.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm">
              <p className="mb-4 text-lg font-semibold text-[#4a2c2a]">
                Recent Users
              </p>

              <div className="space-y-4">
                {users.slice(0, 3).map((user, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-[#f1e5df] bg-[#fffaf7] p-4"
                  >
                    <p className="font-semibold text-[#3e2f2b]">{user.name}</p>
                    <p className="text-sm text-[#6b7280]">{user.email}</p>
                    <p className="text-sm text-[#6b7280]">{user.phone}</p>
                  </div>
                ))}

                {users.length === 0 && (
                  <p className="text-sm text-[#7a6f6b]">No users found.</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-lg font-semibold text-[#4a2c2a]">
                  Recent Orders
                </p>
                <Link
                  href="/admin/orders"
                  className="text-sm font-medium text-[#7a1f2b] transition hover:text-[#8d2742]"
                >
                  View All →
                </Link>
              </div>

              {recentOrdersLoading ? (
                <p className="text-sm text-[#6b7280]">Loading orders...</p>
              ) : recentOrders.length === 0 ? (
                <p className="text-sm text-[#7a6f6b]">No orders found.</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order: any) => (
                    <div
                      key={order._id}
                      className="rounded-2xl border border-[#f1e5df] bg-[#fffaf7] p-4 transition hover:border-[#ead2d8]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-[#3e2f2b]">
                            {order._id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm text-[#6b7280]">
                            {order.user?.name || "Guest"}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-[#7a1f2b]">
                              ₹{order.totalAmount}
                            </p>
                            <p className="text-xs text-[#6b7280]">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div>
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                getStatusBadgeStyle(order.status).bg
                              } ${getStatusBadgeStyle(order.status).text}`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}