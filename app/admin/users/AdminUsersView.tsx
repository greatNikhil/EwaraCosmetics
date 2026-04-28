"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/utils/api";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

interface AdminUser {
  _id: string;
  name: string;
  lastname?: string;
  email: string;
  phone?: string | null;
  role: "user" | "admin";
  createdAt: string;
}

const USER_ADMIN_STATE_STORAGE_KEY = "ewara-admin-user-management-state";

interface UserManagementState {
  blockedUserIds: string[];
  deletedUserIds: string[];
}

export interface AdminUsersPageProps {
  externalSearchTerm?: string;
  inventoryMode?: boolean;
}

export function AdminUsersView({
  externalSearchTerm = "",
}: AdminUsersPageProps) {
  const router = useRouter();
  const {
    user: currentAdmin,
    token,
    isAuthorized,
    isChecking,
  } = useProtectedRoute({ requireAdmin: true });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const currentAdminId = currentAdmin?._id || currentAdmin?.id;

  const loadUsers = async () => {
    if (!token || !isAuthorized) {
      return;
    }

    try {
      const res = await fetch(buildApiUrl("/api/admin/users"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFeedback({
          type: "error",
          message: data.message || "Failed to load users",
        });
        return;
      }

      setUsers(data.users || []);
      setFeedback(null);
    } catch (error) {
      console.error("LOAD USERS ERROR:", error);
      setFeedback({
        type: "error",
        message: "Failed to load users",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !isAuthorized) {
      if (!isChecking) {
        setLoading(false);
      }
      return;
    }

    loadUsers();
  }, [isAuthorized, isChecking, token]);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem(USER_ADMIN_STATE_STORAGE_KEY);

      if (!storedState) {
        return;
      }

      const parsedState = JSON.parse(storedState) as Partial<UserManagementState>;
      setBlockedUserIds(Array.isArray(parsedState.blockedUserIds) ? parsedState.blockedUserIds : []);
      setDeletedUserIds(Array.isArray(parsedState.deletedUserIds) ? parsedState.deletedUserIds : []);
    } catch (error) {
      console.error("LOAD USER MANAGEMENT STATE ERROR:", error);
    }
  }, []);

  useEffect(() => {
    setSearchTerm(externalSearchTerm);
  }, [externalSearchTerm]);

  const persistUserManagementState = (
    nextBlockedUserIds: string[],
    nextDeletedUserIds: string[]
  ) => {
    localStorage.setItem(
      USER_ADMIN_STATE_STORAGE_KEY,
      JSON.stringify({
        blockedUserIds: nextBlockedUserIds,
        deletedUserIds: nextDeletedUserIds,
      })
    );
  };

  const visibleUsers = useMemo(
    () => users.filter((user) => !deletedUserIds.includes(user._id)),
    [deletedUserIds, users]
  );

  const filteredUsers = useMemo(() => {
    return visibleUsers.filter((user) => {
      const fullName = `${user.name} ${user.lastname || ""}`.trim().toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone || "").includes(searchTerm);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [visibleUsers, searchTerm, roleFilter]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf8f6]">
        <p className="text-[#7a1f2b]">Checking admin access...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  const handleViewOrders = (user: AdminUser) => {
    const userDisplayName =
      [user.name, user.lastname].filter(Boolean).join(" ") || user.email;

    router.push(
      `/admin/orders?userId=${encodeURIComponent(user._id)}&userName=${encodeURIComponent(userDisplayName)}`
    );
  };

  const handleToggleBlocked = (userId: string) => {
    const targetUser = users.find((user) => user._id === userId);

    if (!targetUser) {
      setFeedback({
        type: "error",
        message: "User not found in the current list.",
      });
      return;
    }

    const isBlocked = blockedUserIds.includes(userId);
    const nextBlockedUserIds = isBlocked
      ? blockedUserIds.filter((id) => id !== userId)
      : [...blockedUserIds, userId];

    setBlockedUserIds(nextBlockedUserIds);
    persistUserManagementState(nextBlockedUserIds, deletedUserIds);
    setFeedback({
      type: "success",
      message: `${
        [targetUser.name, targetUser.lastname].filter(Boolean).join(" ") || targetUser.email
      } is now ${isBlocked ? "active" : "blocked"}.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find((user) => user._id === userId);

    if (!targetUser) {
      setFeedback({
        type: "error",
        message: "User not found in the current list.",
      });
      return;
    }

    const userDisplayName =
      [targetUser.name, targetUser.lastname].filter(Boolean).join(" ") || targetUser.email;

    if (!window.confirm(`Delete ${userDisplayName} from the User Management list?`)) {
      return;
    }

    const nextDeletedUserIds = [...deletedUserIds, userId];
    const nextBlockedUserIds = blockedUserIds.filter((id) => id !== userId);

    setDeletedUserIds(nextDeletedUserIds);
    setBlockedUserIds(nextBlockedUserIds);
    persistUserManagementState(nextBlockedUserIds, nextDeletedUserIds);
    setFeedback({
      type: "success",
      message: `${userDisplayName} has been removed from the User Management list.`,
    });
  };

  const totalAdmins = visibleUsers.filter((user) => user.role === "admin").length;
  const totalCustomers = visibleUsers.length - totalAdmins;

  return (
      <div className="min-h-screen bg-[#fdf8f6] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#4a2c2a]">
              User Management
            </h1>
            <p className="mt-2 text-[#5e3339]">
              Browse users and manage admin access safely.
            </p>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-[#ead2d8] bg-white p-5 shadow-sm">
              <p className="text-sm uppercase tracking-[0.18em] text-[#7a1f2b]/70">
                Total Users
              </p>
              <p className="mt-3 text-3xl font-semibold text-[#3e2f2b]">{visibleUsers.length}</p>
            </div>

            <div className="rounded-3xl border border-[#ead2d8] bg-white p-5 shadow-sm">
              <p className="text-sm uppercase tracking-[0.18em] text-[#7a1f2b]/70">
                Admins
              </p>
              <p className="mt-3 text-3xl font-semibold text-[#3e2f2b]">{totalAdmins}</p>
            </div>

            <div className="rounded-3xl border border-[#ead2d8] bg-white p-5 shadow-sm">
              <p className="text-sm uppercase tracking-[0.18em] text-[#7a1f2b]/70">
                Customers
              </p>
              <p className="mt-3 text-3xl font-semibold text-[#3e2f2b]">{totalCustomers}</p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm md:grid-cols-[1.5fr_0.5fr]">
            <input
              type="text"
              placeholder="Search by name, email, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 outline-none focus:border-[#7a1f2b]"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-[#ead2d8] bg-[#fffaf7] px-4 py-3 outline-none focus:border-[#7a1f2b]"
            >
              <option value="All">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
          </div>

          {feedback && (
            <div
              className={`mb-6 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                feedback.type === "success"
                  ? "border-[#cfe6bd] bg-[#f3faeb] text-[#3b6d11]"
                  : "border-[#f3c5c5] bg-[#fff3f3] text-[#a32d2d]"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="rounded-3xl border border-[#ead2d8] bg-white p-6 shadow-sm">
            {loading ? (
              <p className="text-[#7a1f2b]">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-[#6b7280]">No users found.</p>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const isCurrentAdmin = currentAdminId === user._id;
                  const isBlocked = blockedUserIds.includes(user._id);
                  const userDisplayName =
                    [user.name, user.lastname].filter(Boolean).join(" ") || user.email;

                  return (
                    <div
                      key={user._id}
                      className="rounded-2xl border border-[#f1e5df] bg-[#fffaf7] p-4"
                    >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-[#3e2f2b]">
                          {[user.name, user.lastname].filter(Boolean).join(" ")}
                          </p>
                          {isCurrentAdmin && (
                            <span className="rounded-full bg-[#f5e8eb] px-3 py-1 text-xs font-medium text-[#7a1f2b]">
                              You
                            </span>
                          )}
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              isBlocked
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {isBlocked ? "Blocked" : "Active"}
                          </span>
                        </div>
                        <p className="text-sm text-[#6b7280]">{user.email}</p>
                        <p className="text-sm text-[#6b7280]">{user.phone || "No phone added"}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#7a1f2b]/70">
                          Joined {new Date(user.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => handleViewOrders(user)}
                        className="rounded-full border border-[#7a1f2b] px-5 py-2 font-semibold text-[#7a1f2b] transition hover:bg-[#f7e7ea]"
                      >
                        View Orders
                      </button>

                      {!isCurrentAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleBlocked(user._id)}
                            className="rounded-full border border-[#7a1f2b] px-5 py-2 font-semibold text-[#7a1f2b] transition hover:bg-[#f7e7ea]"
                          >
                            {isBlocked ? "Unblock User" : "Block User"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user._id)}
                            className="rounded-full bg-red-500 px-5 py-2 font-semibold text-white transition hover:bg-red-600"
                          >
                            Delete User
                          </button>
                        </>
                      )}
                    </div>
                    {!isCurrentAdmin && isBlocked && (
                      <p className="mt-3 text-right text-xs text-[#8a7f7b]">
                        {userDisplayName} is hidden from active access in this admin view.
                      </p>
                    )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

export default function AdminUsersPage() {
  return <AdminUsersView />;
}
