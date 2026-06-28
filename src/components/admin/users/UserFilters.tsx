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
        <div className="bg-surface-0 border border-surface-300 rounded-2xl p-4 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-4">
                {/* Search Input and Button */}
                <div className="lg:col-span-2 flex gap-2">
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-surface-300 bg-surface-200 text-text-primary text-sm outline-none focus:ring-2 focus:ring-brand-500 placeholder-text-muted transition-shadow"
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
                        className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                        Search
                    </button>
                </div>

                {/* Role Filter */}
                <select
                    className="w-full text-sm p-2 bg-surface-200 border border-surface-300 rounded-xl text-text-secondary outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                    defaultValue={searchParams.get("role") ?? "ALL"}
                    onChange={(e) => handleRole(e.target.value)}
                >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                    <option value="STUDENT">Student</option>
                </select>

                {/* Verification Filter */}
                <select
                    className="w-full text-sm p-2 bg-surface-200 border border-surface-300 rounded-xl text-text-secondary outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
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