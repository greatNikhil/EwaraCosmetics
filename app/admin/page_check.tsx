"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { getAllProducts } from "@/utils/productApi";
import { getAllOrders } from "@/utils/orderUtils";

interface UserSummary {
  name: string;
  email: string;
  phone: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState(0);
  const [orders, setOrders] = useState(0);
  const [users, setUsers] = useState<UserSummary[]>([]);

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch products from backend
        const productsData = await getAllProducts();
        const productsList = Array.isArray(productsData)
          ? productsData
          : (productsData.products || []);
        const publishedCount = productsList.filter(
          (p: any) => p.isPublished === true
        ).length;
        setProducts(publishedCount);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts(0);
      }

      try {
        // Fetch orders from local storage
        setOrders(getAllOrders().length);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders(0);
      }
    };

    fetchData();

    fetchData();

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
      const currentUser = localStorage.getItem("userData");
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          parsedUsers = [
            {
              name: user.name || "Guest",
              email: user.email || "not-set@example.com",
              phone: user.phone || "-",
            },
          ];
        } catch {
          parsedUsers = [];
        }
      }
    }

    setUsers(parsedUsers);
  }, [router]);

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
              <p className="mt-2 text-[#5e3339] max-w-2xl">
                Manage products, orders, and users from the admin control panel.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/products"
                className="rounded-full bg-[#7a1f2b] px-6 py-3 text-white font-semibold shadow-lg shadow-[#7a1f2b]/20 transition hover:bg-[#8d2742]"
              >
                Manage Products
              </Link>
              <Link
                href="/admin/orders"
                className="rounded-full border border-[#7a1f2b] px-6 py-3 text-[#7a1f2b] font-semibold transition hover:bg-[#f7e7ea]"
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
              <p className="mt-4 text-4xl font-bold text-[#4a2c2a]">{orders}</p>
              <p className="mt-2 text-sm text-[#6b7280]">
                Orders tracked from user checkout activity.
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
              <p className="text-lg font-semibold text-[#4a2c2a] mb-4">
                Recent Users
              </p>
              <div className="space-y-4">
                {users.slice(0, 3).map((user, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-[#f1e5df] p-4 bg-[#fffaf7]"
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
          </div>
        </div>
      </div>
    </>
  );
}
