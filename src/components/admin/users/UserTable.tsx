/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/lib/api/UserApi";
import {
  Loader2,
  Trash2,
  UserCheck,
  ShieldAlert,
  Shield,
  GraduationCap,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

type Role = "ADMIN" | "STAFF" | "STUDENT";

interface UserItem {
  id: string;
  email: string;
  role: Role;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  isVerified: boolean;
  createdAt: string;
}

interface Props {
  users: UserItem[];
  meta: {
    page: number;
    totalPages: number;
    total: number;
  };
}

const ROLE_CONFIG: Record<
  Role,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
  }
> = {
  ADMIN: {
    label: "Admin",
    icon: <Shield className="w-3 h-3" />,
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  STAFF: {
    label: "Staff",
    icon: <Users className="w-3 h-3" />,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  STUDENT: {
    label: "Student",
    icon: <GraduationCap className="w-3 h-3" />,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
};

function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function Avatar({
  firstName,
  lastName,
  email,
}: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const initials =
    [firstName?.[0], lastName?.[0]].filter(Boolean).join("").toUpperCase() ||
    email[0].toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 select-none">
      {initials}
    </div>
  );
}

export default function UserTable({ users: initialUsers, meta }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    setUpdatingUserId(userId);
    try {
      await userService.update(userId, { role: newRole });
      toast.success("Role updated");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleVerification = async (userId: string, current: boolean) => {
    setUpdatingUserId(userId);
    try {
      const next = !current;
      await userService.update(userId, { isVerified: next });
      toast.success(next ? "User verified" : "Marked unverified");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isVerified: next } : u)),
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update verification.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Permanently delete this user?")) return;
    try {
      await userService.delete(userId);
      toast.success("User removed");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user.");
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`/admin/users?${params.toString()}`);
  };

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="py-20 text-center">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">No users found</p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                User
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                Department
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                Role
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                Status
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                Joined
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((item) => {
              const name =
                [item.firstName, item.lastName].filter(Boolean).join(" ") ||
                "Guest User";
              const isUpdating = updatingUserId === item.id;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* User */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar
                        firstName={item.firstName}
                        lastName={item.lastName}
                        email={item.email}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {name}
                        </p>
                        <p className="text-xs text-slate-400 font-mono truncate">
                          {item.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-5 py-3.5">
                    {item.department ? (
                      <span className="text-sm text-slate-600">
                        {item.department}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>

                  {/* Role */}
                  <td className="px-5 py-3.5">
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <RoleBadge role={item.role} />
                        <select
                          value={item.role}
                          onChange={(e) =>
                            handleUpdateRole(item.id, e.target.value as Role)
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 border border-slate-200 rounded-lg bg-white text-slate-600 outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
                          title="Change role"
                        >
                          <option value="STUDENT">Student</option>
                          <option value="STAFF">Staff</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    )}
                  </td>

                  {/* Verification */}
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() =>
                        handleToggleVerification(item.id, item.isVerified)
                      }
                      disabled={isUpdating}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                        item.isVerified
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      {item.isVerified ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          Verified
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3 h-3" />
                          Unverified
                        </>
                      )}
                    </button>
                  </td>

                  {/* Joined */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>

                  {/* Delete */}
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDeleteUser(item.id)}
                      disabled={isUpdating}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                      title="Delete user"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Page {meta.page} of {meta.totalPages} &middot;{" "}
            <span className="font-medium text-slate-600">
              {meta.total} users
            </span>
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={meta.page <= 1}
              onClick={() => handlePageChange(meta.page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => handlePageChange(meta.page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
