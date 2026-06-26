"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Device, Category, DeviceListResponse } from "@/lib/api/device.api";
import { getDevices } from "@/lib/api/device.api";
import DeviceFormModal from "./DeviceFormModal";
import DeviceDeleteModal from "./DeviceDeleteModal";
import DeviceStatusBadge from "./DeviceStatusBadge";


interface Props {
    initialData: DeviceListResponse;
    categories: Category[];
    searchParams: {
        page?: string;
        search?: string;
        categoryId?: string;
        status?: string;
    };
}

export default function DeviceTable({ initialData, categories, searchParams }: Props) {
    const router = useRouter();
    const [data, setData] = useState<DeviceListResponse>(initialData);
    const [isPending, startTransition] = useTransition();

    // Modal state
    const [createOpen, setCreateOpen] = useState(false);
    const [editDevice, setEditDevice] = useState<Device | null>(null);
    const [deleteDevice, setDeleteDevice] = useState<Device | null>(null);

    const currentPage = Number(searchParams.page ?? 1);

    const refresh = useCallback(() => {
        startTransition(async () => {
            const params: Record<string, any> = { ...searchParams, limit: 10 };
            const fresh = await getDevices(params);
            setData(fresh);
        });
    }, [searchParams]);

    function handleSaved() {
        setCreateOpen(false);
        setEditDevice(null);
        refresh();
    }

    function handleDeleted() {
        setDeleteDevice(null);
        refresh();
    }

    function goPage(page: number) {
        const params = new URLSearchParams(
            Object.entries(searchParams).filter(([, v]) => !!v) as [string, string][],
        );
        params.set("page", String(page));
        router.push(`?${params.toString()}`);
    }

    const { data: devices, meta } = data;

    return (
        <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-body-sm" style={{ color: "var(--color-text-muted)" }}>
                    {meta.total} device{meta.total !== 1 ? "s" : ""} found
                </p>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setCreateOpen(true)}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Device
                </button>
            </div>

            {/* Table */}
            <div className="table-wrap" style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.15s" }}>
                {devices.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center gap-2 py-16"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <path d="M8 21h8M12 17v4" />
                        </svg>
                        <p className="text-body-sm">No devices found.</p>
                        <button className="btn btn-secondary btn-xs mt-1" onClick={() => setCreateOpen(true)}>
                            Add your first device
                        </button>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Device</th>
                                <th>Serial No.</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Warranty</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map((device) => (
                                <DeviceRow
                                    key={device.id}
                                    device={device}
                                    onEdit={() => setEditDevice(device)}
                                    onDelete={() => setDeleteDevice(device)}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-caption">
                        Page {meta.page} of {meta.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            className="btn btn-ghost btn-xs"
                            disabled={currentPage <= 1}
                            onClick={() => goPage(currentPage - 1)}
                        >
                            ← Prev
                        </button>
                        {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    className={`btn btn-xs ${page === currentPage ? "btn-primary" : "btn-ghost"}`}
                                    onClick={() => goPage(page)}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            className="btn btn-ghost btn-xs"
                            disabled={currentPage >= meta.totalPages}
                            onClick={() => goPage(currentPage + 1)}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {createOpen && (
                <DeviceFormModal
                    categories={categories}
                    onClose={() => setCreateOpen(false)}
                    onSaved={handleSaved}
                />
            )}
            {editDevice && (
                <DeviceFormModal
                    device={editDevice}
                    categories={categories}
                    onClose={() => setEditDevice(null)}
                    onSaved={handleSaved}
                />
            )}
            {deleteDevice && (
                <DeviceDeleteModal
                    device={deleteDevice}
                    onClose={() => setDeleteDevice(null)}
                    onDeleted={handleDeleted}
                />
            )}
        </>
    );
}

// ── Row ───────────────────────────────────────────────────

function DeviceRow({
    device,
    onEdit,
    onDelete,
}: {
    device: Device;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const primaryImage = device.images?.find((i) => i.isPrimary) ?? device.images?.[0];
    const isWarrantyExpired = new Date(device.warrantyExpiry) < new Date();

    return (
        <tr>
            {/* Device name + image */}
            <td>
                <div className="flex items-center gap-3">
                    <div
                        className="rounded overflow-hidden flex-shrink-0"
                        style={{
                            width: 40,
                            height: 40,
                            background: "var(--color-surface-100)",
                            border: "1px solid var(--color-surface-300)",
                        }}
                    >
                        {primaryImage ? (
                            <img src={primaryImage.url} alt={device.name} className="w-full h-full object-cover" />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ color: "var(--color-text-muted)" }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="m21 15-5-5L5 21" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-label" style={{ color: "var(--color-text-primary)" }}>
                            {device.name}
                        </p>
                        <p className="text-caption">
                            {device.brand} · {device.model}
                        </p>
                    </div>
                </div>
            </td>

            {/* Serial */}
            <td>
                <span className="text-mono">{device.serialNumber}</span>
            </td>

            {/* Category */}
            <td>
                <span className="text-body-sm">{device.category?.name ?? "—"}</span>
            </td>

            {/* Price */}
            <td>
                <span className="text-label" style={{ color: "var(--color-text-primary)" }}>
                    ৳{Number(device.price).toLocaleString()}
                </span>
            </td>

            {/* Status */}
            <td>
                <DeviceStatusBadge status={device.status} />
            </td>

            {/* Warranty */}
            <td>
                <span
                    className="text-body-sm"
                    style={{ color: isWarrantyExpired ? "var(--color-danger-500)" : "var(--color-text-secondary)" }}
                >
                    {isWarrantyExpired && "⚠ "}
                    {new Date(device.warrantyExpiry).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                </span>
            </td>

            {/* Actions */}
            <td>
                <div className="flex items-center gap-1">
                    <button
                        className="btn btn-icon btn-xs"
                        title="Edit device"
                        onClick={onEdit}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button
                        className="btn btn-icon btn-xs"
                        title="Delete device"
                        onClick={onDelete}
                        style={{ color: "var(--color-danger-500)", borderColor: "var(--color-danger-50)" }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
}
