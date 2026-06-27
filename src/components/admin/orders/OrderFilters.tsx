// components/admin/orders/OrderFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export default function OrderFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const status = searchParams.get("status") || "";

    // sync search input যদি URL থেকে clear হয়
    useEffect(() => {
        setSearch(searchParams.get("search") || "");
    }, [searchParams]);

    function updateQuery(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set("page", "1");
        router.push(`/admin/orders?${params.toString()}`);
    }

    function handleSearch() {
        updateQuery("search", search.trim());
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") handleSearch();
    }

    function clearSearch() {
        setSearch("");
        updateQuery("search", "");
    }

    function resetAll() {
        setSearch("");
        router.push("/admin/orders");
    }

    const hasFilters = !!searchParams.get("search") || !!searchParams.get("status");

    return (
        <div className="card-flat">
            <div className="flex flex-wrap gap-3 items-end">

                {/* Search */}
                <div className="flex-1 min-w-[220px]">
                    <label className="form-label">Search Order</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                                size={14}
                            />
                            <input
                                className="input pl-8 pr-8"
                                placeholder="Order number, customer name…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            {search && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={handleSearch}>
                            Search
                        </button>
                    </div>
                </div>

                {/* Status filter */}
                <div className="min-w-[160px]">
                    <label className="form-label">Order Status</label>
                    <select
                        className="input select"
                        value={status}
                        onChange={(e) => updateQuery("status", e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>

                {/* Reset */}
                {hasFilters && (
                    <div className="flex items-end">
                        <button onClick={resetAll} className="btn btn-ghost btn-sm">
                            <X size={13} />
                            Reset
                        </button>
                    </div>
                )}
            </div>

            {/* Active filter chips */}
            {hasFilters && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {searchParams.get("search") && (
                        <span className="tag-code flex items-center gap-1.5">
                            Search: "{searchParams.get("search")}"
                            <button onClick={clearSearch}>
                                <X size={10} />
                            </button>
                        </span>
                    )}
                    {searchParams.get("status") && (
                        <span className="tag-code flex items-center gap-1.5">
                            Status: {searchParams.get("status")}
                            <button onClick={() => updateQuery("status", "")}>
                                <X size={10} />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}