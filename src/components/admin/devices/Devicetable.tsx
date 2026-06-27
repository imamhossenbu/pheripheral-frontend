


"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Device, DeviceListResponse } from "@/lib/api/device.api";
import type { CategoryTree } from "@/lib/api/category.api";
import { getDevices } from "@/lib/api/device.api";
import DeviceFormModal from "./DeviceFormModal";
import DeviceDeleteModal from "./DeviceDeleteModal";
import DeviceStatusBadge from "./DeviceStatusBadge";
import { FiEdit2, FiTrash2, FiEye, FiX } from "react-icons/fi";

// ─── Toast Logic ──────────────────────────────────────────
type ToastType = "success" | "error";
interface Toast { id: number; message: string; type: ToastType; }
let toastId = 0;

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
    return (
        <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", zIndex: 99999 }}>
            {toasts.map(t => (
                <div key={t.id} onClick={() => onRemove(t.id)} style={{ padding: "0.8rem 1.2rem", borderRadius: "8px", background: t.type === "success" ? "#16a34a" : "#dc2626", color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                    {t.message}
                </div>
            ))}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────
export default function DeviceTable({ initialData, categories, searchParams }: any) {
    const [data, setData] = useState<DeviceListResponse>(initialData);
    const [isPending, startTransition] = useTransition();
    const [toasts, setToasts] = useState<Toast[]>([]);

    const [createOpen, setCreateOpen] = useState(false);
    const [editDevice, setEditDevice] = useState<Device | null>(null);
    const [deleteDevice, setDeleteDevice] = useState<Device | null>(null);
    const [detailDevice, setDetailDevice] = useState<Device | null>(null);

    const showToast = (message: string, type: ToastType = "success") => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    const refresh = useCallback(async () => {
        startTransition(async () => {
            const fresh = await getDevices({ ...searchParams });
            setData(fresh);
        });
    }, [searchParams]);

    return (
        <div style={{ opacity: isPending ? 0.6 : 1 }}>
            <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <p style={{ color: "#666" }}>{data.meta.total} devices found</p>
                <button onClick={() => setCreateOpen(true)} style={{ padding: "10px 20px", background: "#EB4D25", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Add Device
                </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        <th style={{ padding: "15px", textAlign: "left" }}>Device</th>
                        <th style={{ padding: "15px", textAlign: "left" }}>Serial No.</th>
                        <th style={{ padding: "15px", textAlign: "left" }}>Status</th>
                        <th style={{ padding: "15px", textAlign: "left" }}>Price</th>
                        <th style={{ padding: "15px", textAlign: "center" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.data.map(device => (
                        <tr key={device.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "15px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "50px", height: "50px", background: "#eee", borderRadius: "4px", overflow: "hidden" }}>
                                        {device.images?.[0] && <img src={device.images[0].url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{device.name}</div>
                                        <div style={{ fontSize: "12px", color: "#666" }}>{device.brand} · {device.model}</div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: "15px", fontFamily: "monospace" }}>{device.serialNumber}</td>
                            <td style={{ padding: "15px" }}><DeviceStatusBadge status={device.status} /></td>
                            <td style={{ padding: "15px" }}>৳{Number(device.price).toLocaleString()}</td>
                            <td style={{ padding: "15px", textAlign: "center" }}>
                                <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                                    <button onClick={() => setDetailDevice(device)} style={{ background: "none", border: "none", cursor: "pointer" }}><FiEye size={22} /></button>
                                    <button onClick={() => setEditDevice(device)} style={{ background: "none", border: "none", cursor: "pointer" }}><FiEdit2 size={22} /></button>
                                    <button onClick={() => setDeleteDevice(device)} style={{ background: "none", border: "none", cursor: "pointer", color: "red" }}><FiTrash2 size={22} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {createOpen && <DeviceFormModal categories={categories} onClose={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); refresh(); showToast("Added successfully"); }} />}
            {editDevice && <DeviceFormModal device={editDevice} categories={categories} onClose={() => setEditDevice(null)} onSaved={() => { setEditDevice(null); refresh(); showToast("Updated successfully"); }} />}
            {deleteDevice && <DeviceDeleteModal device={deleteDevice} onClose={() => setDeleteDevice(null)} onDeleted={() => { setDeleteDevice(null); refresh(); showToast("Deleted successfully"); }} />}
            {detailDevice && <DeviceDetailDrawer device={detailDevice} onClose={() => setDetailDevice(null)} />}
        </div>
    );
}

function DeviceDetailDrawer({ device, onClose }: { device: Device; onClose: () => void }) {
    const primaryImage = device.images?.find(i => i.isPrimary) ?? device.images?.[0];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                style={{ maxWidth: "38rem", width: "100%", maxHeight: "92dvh", overflowY: "auto" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                        {primaryImage && (
                            <img src={primaryImage.url} alt={device.name} className="rounded object-cover flex-shrink-0" style={{ width: 56, height: 56, border: "1px solid var(--color-surface-300)" }} />
                        )}
                        <div>
                            <h2 className="text-heading-sm">{device.name}</h2>
                            <p className="text-caption">{device.brand} · {device.model}</p>
                        </div>
                    </div>
                    <button className="btn btn-icon" onClick={onClose}><FiX size={16} /></button>
                </div>

                {/* Info grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }} className="mb-5">
                    <InfoRow label="Serial No." value={device.serialNumber} mono />
                    <InfoRow label="Category" value={device.category?.name ?? "—"} />
                    <InfoRow label="Price" value={`৳${Number(device.price).toLocaleString()}`} />
                    <InfoRow label="Status" value={<DeviceStatusBadge status={device.status} />} />
                    <InfoRow label="Purchase Date" value={new Date(device.purchaseDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} />
                    <InfoRow label="Warranty Expiry" value={new Date(device.warrantyExpiry).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} />
                </div>

                {/* Description */}
                {device.description && (
                    <div className="mb-4">
                        <p className="form-label mb-1">Description</p>
                        <p className="text-body-sm" style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{device.description}</p>
                    </div>
                )}

                {/* Variants */}
                {device.variants?.length > 0 && (
                    <>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-overline">Variants</span>
                            <div style={{ flex: 1, height: 1, background: "var(--color-surface-300)" }} />
                        </div>
                        <div className="flex flex-col gap-2 mb-4">
                            {device.variants.map(v => (
                                <div key={v.id} className="rounded px-4 py-3" style={{ background: "var(--color-surface-50)", border: "1px solid var(--color-surface-300)" }}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-label" style={{ color: "var(--color-text-primary)" }}>{v.name}</span>
                                        <div className="flex items-center gap-2">
                                            {!v.isActive && <span className="badge badge-muted" style={{ fontSize: 10 }}>Inactive</span>}
                                            <span className="text-caption">Stock: <strong>{v.stock}</strong></span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {v.sku && <span className="text-caption">SKU: <span className="text-mono">{v.sku}</span></span>}
                                        {v.price != null && <span className="text-caption">Price: ৳{Number(v.price).toLocaleString()}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Images */}
                {device.images?.length > 1 && (
                    <>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-overline">Images</span>
                            <div style={{ flex: 1, height: 1, background: "var(--color-surface-300)" }} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {device.images.map(img => (
                                <img key={img.id} src={img.url} alt="" className="rounded object-cover" style={{ width: 72, height: 72, border: img.isPrimary ? "2px solid var(--color-accent-500)" : "1px solid var(--color-surface-300)" }} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}


function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div>
            <p className="form-label mb-0.5">{label}</p>
            <p className={mono ? "text-mono text-body-sm" : "text-body-sm"} style={{ color: "var(--color-text-primary)" }}>{value}</p>
        </div>
    );
}