"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/lib/api/UserApi";
import { Loader2, Trash2, UserCheck, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

interface UserItem {
    id: string;
    email: string;
    role: "ADMIN" | "EDITOR" | "VIEWER";
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

export default function UserTable({ users: initialUsers, meta }: Props) {
    const router = useRouter();
    const [users, setUsers] = useState<UserItem[]>(initialUsers);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    // সার্ভার কম্পোনেন্ট থেকে আসা নতুন ডেটা সিঙ্ক করার জন্য
    React.useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);

    const handleUpdateRole = async (userId: string, newRole: "ADMIN" | "EDITOR" | "VIEWER") => {
        setUpdatingUserId(userId);
        try {
            await userService.update(userId, { role: newRole });
            toast.success("User role updated successfully!");
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            router.refresh(); // সার্ভার স্টেট রিফ্রেশ করার জন্য
        } catch (err: any) {
            toast.error(err.message || "Failed to update role.");
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
        setUpdatingUserId(userId);
        try {
            const nextStatus = !currentStatus;
            await userService.update(userId, { isVerified: nextStatus });
            toast.success(nextStatus ? "User verified successfully!" : "User marked unverified.");
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: nextStatus } : u));
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to update verification.");
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you absolutely sure you want to permanently delete this user?")) return;
        try {
            await userService.delete(userId);
            toast.success("User account removed!");
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

    return (
        <div className="bg-white  border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            {users.length === 0 ? (
                <div className="p-16 text-center text-gray-400 italic">
                    No registered users match your filters.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
                        <thead>
                            <tr className="text-gray-400 font-bold uppercase tracking-wider text-[10px] bg-gray-50 dark:bg-gray-900/50">
                                <th className="p-4">User</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Department</th>
                                <th className="p-4">Role Access</th>
                                <th className="p-4">Verification</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-300">
                            {users.map((item) => (
                                <tr key={item.id} className="hover:bg-orange-50/20 dark:hover:bg-orange-950/5 transition-colors">
                                    <td className="p-4">
                                        <p className="font-extrabold text-gray-900 dark:text-white text-sm">
                                            {item.firstName || item.lastName ? `${item.firstName || ""} ${item.lastName || ""}`.trim() : "Guest User"}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Joined: {new Date(item.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="p-4 font-mono text-gray-500 dark:text-gray-400">{item.email}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-semibold text-gray-500 dark:text-gray-400">
                                            {item.department || "—"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {updatingUserId === item.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                                        ) : (
                                            <select
                                                value={item.role}
                                                onChange={(e) => handleUpdateRole(item.id, e.target.value as any)}
                                                className="text-xs p-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
                                            >
                                                <option value="VIEWER">Viewer (Read Only)</option>
                                                <option value="EDITOR">Editor (Write)</option>
                                                <option value="ADMIN">Admin (Root)</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleToggleVerification(item.id, item.isVerified)}
                                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] tracking-wider uppercase border ${item.isVerified
                                                ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30"
                                                : "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/30"
                                            }`}
                                        >
                                            {item.isVerified ? (
                                                <>
                                                    <UserCheck className="w-3 h-3" />
                                                    <span>Verified</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ShieldAlert className="w-3 h-3" />
                                                    <span>Unverified</span>
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDeleteUser(item.id)}
                                            className="p-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <button
                        disabled={meta.page <= 1}
                        onClick={() => handlePageChange(meta.page - 1)}
                        className="px-3 py-1 text-xs font-semibold bg-gray-50 border rounded-lg disabled:opacity-50 hover:bg-orange-50 text-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-gray-500">Page {meta.page} of {meta.totalPages}</span>
                    <button
                        disabled={meta.page >= meta.totalPages}
                        onClick={() => handlePageChange(meta.page + 1)}
                        className="px-3 py-1 text-xs font-semibold bg-gray-50 border rounded-lg disabled:opacity-50 hover:bg-orange-50 text-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}