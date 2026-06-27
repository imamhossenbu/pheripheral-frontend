// components/admin/orders/OrderStats.tsx
// Server component — no "use client"

import { Order } from "@/lib/api/OrderApi";


interface Props {
    orders: Order[];
    total: number;
    filtered: boolean;
}

export default function OrderStats({ orders, total, filtered }: Props) {
    // page এর data থেকে counts (filtered result এর basis এ)
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const processing = orders.filter((o) => o.status === "PROCESSING").length;
    const completed = orders.filter((o) => o.status === "COMPLETED").length;
    const cancelled = orders.filter((o) => o.status === "CANCELLED").length;
    const revenue = orders
        .filter((o) => o.status === "COMPLETED")
        .reduce((s, o) => s + Number(o.total), 0);

    const cards = [
        {
            label: "Total Orders",
            value: total,
            sub: filtered ? "filtered results" : "all time",
            accent: "var(--color-brand-500)",
            bg: "var(--color-brand-50)",
            color: "var(--color-brand-600)",
        },
        {
            label: "Pending",
            value: pending,
            sub: "awaiting processing",
            accent: "var(--color-warning-400)",
            bg: "var(--color-warning-50)",
            color: "var(--color-warning-500)",
        },
        {
            label: "Processing",
            value: processing,
            sub: "in progress",
            accent: "var(--color-info-400)",
            bg: "var(--color-info-50)",
            color: "var(--color-info-500)",
        },
        {
            label: "Completed",
            value: completed,
            sub: "fulfilled",
            accent: "var(--color-success-400)",
            bg: "var(--color-success-50)",
            color: "var(--color-success-500)",
        },
        {
            label: "Revenue",
            value: `৳${revenue.toLocaleString()}`,
            sub: "from completed",
            accent: "var(--color-accent-500)",
            bg: "var(--color-info-50)",
            color: "var(--color-accent-500)",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {cards.map((c) => (
                <div
                    key={c.label}
                    className="stat-card relative overflow-hidden"
                    style={{ paddingTop: "1rem" }}
                >
                    <div
                        className="absolute top-0 left-0 right-0 h-0.5"
                        style={{ background: c.accent }}
                    />
                    <p
                        className="stat-value"
                        style={{ color: c.color, fontSize: "var(--font-size-2xl)" }}
                    >
                        {typeof c.value === "number" ? c.value.toLocaleString() : c.value}
                    </p>
                    <p className="stat-label mt-1">{c.label}</p>
                    <p className="text-caption mt-0.5">{c.sub}</p>
                </div>
            ))}
        </div>
    );
}