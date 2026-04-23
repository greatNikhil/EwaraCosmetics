"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import OrderCard from "@/components/orders/OrderCard";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const { orders } = useOrders();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
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

  const userKey = user?.email || user?.phone;
  const defaultAddress = addresses.find((addr) => addr.default) || addresses[0];
  const sortedAddresses = [...addresses].sort(
    (a, b) => Number(b.default) - Number(a.default)
  );

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success || !data.user) {
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("isAdmin");
          router.push("/login");
          return;
        }

        setUser(data.user);
        localStorage.setItem("userData", JSON.stringify(data.user));
      } catch (error) {
        console.error("PROFILE LOAD ERROR:", error);
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
        event.key?.startsWith("addresses_") ||
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
    if (!user || !userKey) {
      setAddresses([]);
      return;
    }

    const stored = localStorage.getItem(`addresses_${userKey}`);
    if (stored) {
      try {
        setAddresses(JSON.parse(stored));
      } catch {
        setAddresses([]);
      }
    } else {
      setAddresses([]);
    }
  }, [user, userKey]);

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

  const scrollToProfile = () => {
    const section = document.getElementById("profile-section");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  const showGuestPopup = (message = "Please login first") => {
    setGuestMessage(message);
  };

  const saveProfile = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: profileForm.name,
      lastname: profileForm.lastname,
      email: profileForm.email,
      phone: profileForm.phone,
    };

    setUser(updatedUser);
    localStorage.setItem("userData", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("userChanged"));
    setIsEditing(false);
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

  const saveAddress = () => {
    if (!validateForm()) return;
    if (!userKey) {
      alert("User not loaded properly. Please refresh and try again.");
      return;
    }

    let updated;

    if (editIndex !== null) {
      updated = addresses.map((item, i) => (i === editIndex ? form : item));
    } else {
      updated = [...addresses, form];
    }

    if (form.default) {
      updated = updated.map((addr, i) => ({
        ...addr,
        default: i === (editIndex !== null ? editIndex : updated.length - 1),
      }));
    }

    if (!updated.some((addr: any) => addr.default) && updated.length > 0) {
      updated[0].default = true;
    }

    setAddresses(updated);
    localStorage.setItem(`addresses_${userKey}`, JSON.stringify(updated));

    const selectedAddress =
      updated.find((addr: any) => addr.default) || updated[0] || null;

    if (selectedAddress) {
      const updatedUser = {
        ...user,
        address: selectedAddress,
      };
      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
    }

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
  };

  const deleteAddress = (index: number) => {
    if (!userKey) return;

    const updated = addresses.filter((_, i) => i !== index);

    if (updated.length > 0 && !updated.some((addr) => addr.default)) {
      updated[0].default = true;
    }

    setAddresses(updated);
    localStorage.setItem(`addresses_${userKey}`, JSON.stringify(updated));

    const updatedUser = {
      ...user,
      address: updated.find((addr) => addr.default) || updated[0] || null,
    };
    setUser(updatedUser);
    localStorage.setItem("userData", JSON.stringify(updatedUser));
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf8f6]">
        <p className="text-lg text-[#5a4f4d]">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="overflow-x-hidden rounded-2xl border border-[#ead2d8] bg-[#fdf8f6] p-6">
      <div className="mx-auto w-full max-w-xl px-3 md:max-w-none md:px-0">
        {guestMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="scale-105 transform rounded-lg bg-[#7a1f2b] px-6 py-4 text-white shadow-2xl rotate-1">
              <p className="text-sm font-medium">{guestMessage}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-6">
          <div className="flex min-h-fit w-full flex-col space-y-3 rounded-2xl border border-[#ead2d8] bg-white p-4 text-sm shadow-sm md:p-5">
            <div
              onClick={() => {
                setActiveTab("profile");
                scrollToProfile();
              }}
              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl p-2 transition hover:bg-[#f7e7ea]"
            >
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-[#3e2f2b]">
                  Hey, User 👋
                </h2>
                <p className="mt-1 text-sm text-[#8a7f7b]">
                  Logged with {user ? user.email || user.phone : "Guest"}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7a1f2b] text-lg font-semibold text-white">
                U
              </div>
            </div>

            <hr />

            <p className="mt-4 text-sm text-[#5a4f4d]">
              <span className="text-base font-semibold text-[#3e2f2b]">
                {orders.length}
              </span>{" "}
              Total Orders
            </p>

            <hr />

            <div className="space-y-6 rounded-2xl border border-[#ead2d8] bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-[#3e2f2b]">Account</h3>

              <div
                onClick={() => setActiveTab("overview")}
                className={`flex cursor-pointer items-center justify-between rounded-xl border border-[#f1e5df] p-4 transition
                ${
                  activeTab === "overview"
                    ? "border-[#e4cfc8] bg-[#f7e7ea]"
                    : "hover:bg-[#f7e7ea]"
                }
                `}
              >
                <div className="flex items-center gap-3">
                  <img src="/favicon/overview.svg" className="h-6 w-6" />
                  <span className="text-base font-semibold text-[#3e2f2b]">
                    Overview
                  </span>
                </div>
                →
              </div>

              <div
                onClick={() => {
                  if (!user) {
                    showGuestPopup();
                    return;
                  }
                  setActiveTab("address");
                }}
                className={`flex cursor-pointer items-center justify-between rounded-xl border border-[#f1e5df] p-4 transition
                ${
                  activeTab === "address"
                    ? "border-[#e4cfc8] bg-[#f7e7ea]"
                    : "hover:bg-[#f7e7ea]"
                }
                `}
              >
                <div className="flex items-center gap-3">
                  <img src="/favicon/address.svg" className="h-6 w-6" />
                  <span className="text-base font-semibold text-[#3e2f2b]">
                    My Address
                  </span>
                </div>
                →
              </div>

              <div
                onClick={() => setActiveTab("orders")}
                className={`flex cursor-pointer items-center justify-between rounded-xl border border-[#f1e5df] p-4 transition
                ${
                  activeTab === "orders"
                    ? "border-[#e4cfc8] bg-[#f7e7ea]"
                    : "hover:bg-[#f7e7ea]"
                }
                `}
              >
                <div className="flex items-center gap-3">
                  <img src="/favicon/orders.svg" className="h-6 w-6" />
                  <span className="text-base font-semibold text-[#3e2f2b]">
                    My Orders
                  </span>
                </div>
                →
              </div>
            </div>

            <div className="flex w-fit items-center gap-2 text-red-500 transition hover:text-red-500">
              <img
                src="/favicon/logout.png"
                alt="logout"
                className="h-5 w-5 object-contain"
              />

              {user ? (
                <span
                  className="text-sm font-medium"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userData");
                    localStorage.removeItem("isLoggedIn");
                    localStorage.removeItem("isAdmin");
                    window.dispatchEvent(new Event("userChanged"));
                    window.location.href = "/login";
                  }}
                >
                  Logout→
                </span>
              ) : (
                <span
                  className="text-sm font-medium"
                  onClick={() => (window.location.href = "/login")}
                >
                  Login→
                </span>
              )}
            </div>
          </div>

          <div
            id="profile-section"
            className="mx-auto min-h-fit w-full max-w-xl rounded-2xl border border-[#ead2d8] bg-white p-8 shadow-sm md:col-span-2 md:mx-0 md:max-w-none"
          >
            {activeTab === "profile" && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h1 className="text-xl font-semibold text-[#3e2f2b]">
                    Profile
                  </h1>
                  <button
                    className="text-sm text-[#7a1f2b] hover:underline"
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

                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <User size={18} />
                    <div className="w-full">
                      <p className="text-sm text-[#8a7f7b]">First Name</p>
                      {isEditing ? (
                        <input
                          value={profileForm.name}
                          className="mt-1 w-full rounded-lg border border-[#ead2d8] bg-[#fffaf7] p-3 text-[#3e2f2b] outline-none focus:ring-2 focus:ring-[#d4a373]"
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-[#3e2f2b]">
                          {user?.name || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User size={18} />
                    <div className="w-full">
                      <p className="text-sm text-[#8a7f7b]">Last Name</p>
                      {isEditing ? (
                        <input
                          value={profileForm.lastname}
                          className="mt-1 w-full rounded-lg border border-[#ead2d8] bg-[#fffaf7] p-3 text-[#3e2f2b] outline-none focus:ring-2 focus:ring-[#d4a373]"
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              lastname: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-[#3e2f2b]">
                          {user?.lastname || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={18} />
                    <div className="w-full">
                      <p className="text-sm text-[#8a7f7b]">Phone Number</p>
                      {isEditing ? (
                        <input
                          value={profileForm.phone}
                          className="mt-1 w-full rounded-lg border border-[#ead2d8] bg-[#fffaf7] p-3 text-[#3e2f2b] outline-none focus:ring-2 focus:ring-[#d4a373]"
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              phone: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          maxLength={10}
                        />
                      ) : (
                        <p className="text-[#3e2f2b]">
                          {user?.phone || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail size={18} />
                    <div className="w-full">
                      <p className="text-sm text-[#8a7f7b]">Email ID</p>
                      {isEditing ? (
                        <input
                          value={profileForm.email}
                          className="mt-1 w-full rounded-lg border border-[#ead2d8] bg-[#fffaf7] p-3 text-[#3e2f2b] outline-none focus:ring-2 focus:ring-[#d4a373]"
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              email: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-[#3e2f2b]">
                          {user?.email || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "overview" && (
              <div>
                <h2 className="mb-6 text-2xl font-semibold text-[#3e2f2b]">
                  Overview
                </h2>

                <h3 className="mb-3 text-base font-semibold text-[#5a4f4d]">
                  My Orders
                </h3>

                {orders.length === 0 ? (
                  <div className="mb-6 flex items-center gap-5 rounded-2xl border border-[#ead2d8] bg-gradient-to-r from-[#fffaf7] to-[#f7e7ea] p-5 transition hover:shadow-md">
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-white object-contain shadow-sm">
                      <img
                        src="/favicon/order.png"
                        alt="orders"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-[#3e2f2b]">
                        No Orders Yet
                      </p>

                      <p className="mt-1 text-sm text-[#7a6f6b]">
                        Start your first order to explore our products.
                      </p>

                      <Link
                        href="/shop"
                        className="mt-2 inline-block cursor-pointer text-sm font-medium text-[#7a1f2b] hover:underline"
                      >
                        Shop Now →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 space-y-3">
                    {orders.slice(0, 2).map((order: any) => (
                      <Link key={order.id} href={`/orders/${order.id}`}>
                        <div className="flex cursor-pointer items-center gap-4 rounded-2xl border border-[#ead2d8] bg-gradient-to-r from-[#fffaf7] to-[#f7e7ea] p-4 transition hover:shadow-md">
                          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white shadow-sm">
                            {order.items[0]?.imageUrl ? (
                              <img
                                src={order.items[0].imageUrl}
                                alt={order.items[0].productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-2xl">
                                🛍️
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-[#3e2f2b]">
                              {order.items[0]?.productName}
                            </p>
                            <p className="text-xs text-[#7a6f6b]">
                              ₹{order.totalAmount.toFixed(2)} • {order.status}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-[#7a1f2b]">
                            →
                          </div>
                        </div>
                      </Link>
                    ))}
                    {orders.length > 2 && (
                      <Link
                        href="/orders"
                        className="text-sm font-medium text-[#7a1f2b] hover:underline"
                      >
                        See All Orders →
                      </Link>
                    )}
                  </div>
                )}

                <div className="mb-3 flex items-center justify-between">
                  <h3 className="mb-3 text-base font-semibold text-[#5a4f4d]">
                    Saved Addresses
                  </h3>
                  <span
                    onClick={() => {
                      if (!user) {
                        showGuestPopup();
                        return;
                      }
                      setActiveTab("address");
                    }}
                    className="cursor-pointer whitespace-nowrap text-sm text-blue-500 text-semibold hover:underline"
                  >
                    See All →
                  </span>
                </div>

                {addresses.length > 0 ? (
                  <div className="rounded-2xl border border-[#ead2d8] bg-gradient-to-r from-[#fffaf7] to-[#f7e7ea] p-5">
                    <p className="font-semibold text-[#3e2f2b]">
                      {defaultAddress.name}
                    </p>

                    <p className="text-sm text-[#7a6f6b]">
                      {defaultAddress.address}
                    </p>

                    <p className="text-sm text-[#7a6f6b]">
                      {defaultAddress.phone}
                    </p>

                    <p className="text-sm text-[#7a6f6b]">
                      {defaultAddress.city}, {defaultAddress.state}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-5 rounded-2xl border border-[#ead2d8] bg-gradient-to-r from-[#fffaf7] to-[#f7e7ea] p-5 transition hover:shadow-md">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white object-contain p-2 shadow-sm">
                      <img
                        src="/favicon/location.png"
                        alt="address"
                        className="h-full w-full scale-125 object-cover"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-[#3e2f2b]">
                        No Address Added
                      </p>

                      <p className="mt-1 text-sm text-[#7a6f6b]">
                        Add your address for faster checkout.
                      </p>

                      <span
                        onClick={() => setActiveTab("address")}
                        className="mt-2 inline-block cursor-pointer text-sm font-medium text-[#7a1f2b] hover:underline"
                      >
                        Add Address →
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "address" && (
              <div>
                <div className="mb-6 flex items-center gap-3">
                  {showForm && (
                    <img
                      src="/favicon/back.svg"
                      className="h-5 w-5 cursor-pointer"
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
                    />
                  )}

                  <h2 className="text-xl font-semibold text-[#3e2f2b]">
                    {showForm ? "Add New Address" : "My Addresses"}
                  </h2>
                </div>

                {addresses.length === 0 && !showForm && (
                  <div className="mt-10 text-center">
                    <p className="text-lg font-medium">No Addresses Found</p>

                    <button
                      onClick={() => {
                        if (!user) {
                          showGuestPopup();
                          return;
                        }
                        setShowForm(true);
                      }}
                      className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white"
                    >
                      Add New Address
                    </button>
                  </div>
                )}

                {addresses.length > 0 && !showForm && (
                  <div className="space-y-4">
                    {sortedAddresses.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-xl border p-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#3e2f2b]">
                              {item.name}
                            </p>
                            {item.default && (
                              <span className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-600">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {item.address}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.pincode}
                          </p>
                          <p className="text-sm text-gray-600">{item.phone}</p>
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
                            <div className="absolute right-0 z-10 mt-2 min-w-[120px] w-32 overflow-hidden rounded-lg border bg-white shadow-md">
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
                                      addr.address === selected.address &&
                                      addr.phone === selected.phone &&
                                      addr.pincode === selected.pincode
                                  );

                                  setEditIndex(actualIndex);
                                  setShowForm(true);
                                  setOpenMenu(null);
                                }}
                                className="flex cursor-pointer item-center gap-2 whitespace-nowrap px-3 py-2 text-sm hover:bg-gray-100 hover:text-blue-500"
                              >
                                <img
                                  src="/favicon/edit.svg"
                                  className="h-5 w-5"
                                />
                                <span className="text-sm">Edit</span>
                              </div>

                              <div
                                onClick={() => {
                                  const selected = sortedAddresses[index];
                                  const actualIndex = addresses.findIndex(
                                    (addr) =>
                                      addr.address === selected.address &&
                                      addr.phone === selected.phone &&
                                      addr.pincode === selected.pincode
                                  );
                                  deleteAddress(actualIndex);
                                  setOpenMenu(null);
                                }}
                                className="flex cursor-pointer items-center gap-2 whitespace-nowrap px-3 py-2 text-sm hover:bg-gray-100 hover:text-red-600"
                              >
                                <img
                                  src="/favicon/delete.svg"
                                  className="h-5 w-5 scale-110"
                                />
                                <span className="text-sm font-medium">
                                  Delete
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <p
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
                      className="cursor-pointer text-blue-600"
                    >
                      + Add New Address
                    </p>
                  </div>
                )}

                {showForm && (
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="text-sm font-semibold text-[#5a4f4d]">
                        PIN Code *
                      </label>
                      <input
                        value={form.pincode}
                        placeholder="Eg: 110001"
                        className="mt-1 w-full rounded-lg border border-[#ead2d8] bg-[#fffaf7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:ring-2 focus:ring-[#d4a373]"
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
                              console.log("Error fetching pincode");
                            }
                          }
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-[#5a4f4d]">
                          City
                        </label>
                        <input
                          value={form.city}
                          disabled
                          className="mt-1 w-full rounded-lg border border-[#ead2d8] bg-gray-100 p-3"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-[#5a4f4d]">
                          State
                        </label>
                        <input
                          value={form.state}
                          disabled
                          className="mt-1 w-full rounded-lg border border-[#ead2d8] bg-gray-100 p-3"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-[#5a4f4d]">
                        Flat / Building No (Optional)
                      </label>
                      <input
                        value={form.flat}
                        placeholder="Eg: A1, Block D"
                        className="mt-1 w-full rounded-lg border border-[#ead2d8] bg-[#fffaf7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:ring-2 focus:ring-[#d4a373]"
                        onChange={(e) =>
                          setForm({ ...form, flat: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-[#5a4f4d]">
                        Complete Address *
                      </label>
                      <input
                        value={form.address}
                        placeholder="Eg: Plot no. 401"
                        className="mt-1 w-full rounded-lg border border-[#ead2d8] bg-[#fffaf7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:ring-2 focus:ring-[#d4a373]"
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

                    <div>
                      <label className="text-sm font-semibold text-[#5a4f4d]">
                        First Name *
                      </label>
                      <input
                        value={form.name}
                        placeholder="Eg: Om"
                        className="mt-1 w-full rounded-lg border border-[#ead2d8] bg-[#fffaf7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:ring-2 focus:ring-[#d4a373]"
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
                      <label className="text-sm font-semibold text-[#5a4f4d]">
                        Last Name (Optional)
                      </label>
                      <input
                        value={form.lastname}
                        placeholder="Eg: Sharma"
                        className="mt-1 w-full rounded-lg border border-[#ead2d8] bg-[#fffaf7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:ring-2 focus:ring-[#d4a373]"
                        onChange={(e) =>
                          setForm({ ...form, lastname: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-[#5a4f4d]">
                        Mobile Number *
                      </label>
                      <input
                        value={form.phone}
                        maxLength={10}
                        placeholder="Eg: 9876543210"
                        className="mt-1 w-full rounded-lg border border-[#ead2d8] bg-[#fffaf7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:ring-2 focus:ring-[#d4a373]"
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

                    <div className="mt-2 flex items-center gap-2">
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
                      className="mt-4 rounded-xl bg-[#7a1f2b] py-3 text-white transition hover:opacity-90"
                    >
                      Save Address
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h2 className="mb-6 text-2xl font-semibold text-[#3e2f2b]">
                  My Orders
                </h2>

                {orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mb-4 text-6xl">📦</div>
                    <p className="text-lg font-medium text-[#3e2f2b]">
                      No Orders Yet
                    </p>
                    <p className="mt-2 text-sm text-[#7a6f6b]">
                      Start shopping to see your orders here.
                    </p>
                    <Link
                      href="/shop"
                      className="mt-6 inline-block rounded-lg bg-[#7a1f2b] px-6 py-3 font-semibold text-white transition hover:shadow-md"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div key={order.id} className="animate-fadeUp">
                        <OrderCard order={order} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}