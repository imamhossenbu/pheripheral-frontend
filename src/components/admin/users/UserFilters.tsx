"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function UserFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") ?? "");

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (search.trim()) {
            params.set("search", search.trim());
        } else {
            params.delete("search");
        }
        params.set("page", "1");
        router.push(`/admin/users?${params.toString()}`);
    };

    const handleRole = (role: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (role === "ALL") {
            params.delete("role");
        } else {
            params.set("role", role);
        }
        params.set("page", "1");
        router.push(`/admin/users?${params.toString()}`);
    };

    const handleVerification = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "ALL") {
            params.delete("isVerified");
        } else {
            params.set("isVerified", value);
        }
        params.set("page", "1");
        router.push(`/admin/users?${params.toString()}`);
    };

    return (
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-4">
                {/* Search */}
                <div className="lg:col-span-2 flex gap-2">
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") applyFilters();
                            }}
                        />
                    </div>
                    <button
                        onClick={applyFilters}
                        className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                        Search
                    </button>
                </div>

                {/* Role Filter */}
                <select
                    className="w-full text-sm p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                    defaultValue={searchParams.get("role") ?? "ALL"}
                    onChange={(e) => handleRole(e.target.value)}
                >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                </select>

                {/* Verification Filter */}
                <select
                    className="w-full text-sm p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                    defaultValue={searchParams.get("isVerified") ?? "ALL"}
                    onChange={(e) => handleVerification(e.target.value)}
                >
                    <option value="ALL">All Verification</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                </select>
            </div>
        </div>
    );
}