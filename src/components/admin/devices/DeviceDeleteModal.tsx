"use client";

import { useState, useTransition } from "react";
import { deleteDevice } from "@/lib/api/device.api";
import type { Device } from "@/lib/api/device.api";

interface Props {
    device: Device;
    onClose: () => void;
    onDeleted: () => void;
}

export default function DeviceDeleteModal({ device, onClose, onDeleted }: Props) {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        setError(null);
        startTransition(async () => {
            try {
                await deleteDevice(device.id);
                onDeleted();
            } catch (err: any) {
                setError(err.message ?? "Failed to delete device.");
            }
        });
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: "28rem" }} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-heading-sm">Delete Device</h2>
                        <p className="text-body-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                            This action cannot be undone.
                        </p>
                    </div>
                    <button className="btn-icon btn" onClick={onClose} aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="alert alert-danger mb-5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: "1px" }}>
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <div>
                        Are you sure you want to delete{" "}
                        <strong>
                            {device.name} — {device.brand} {device.model}
                        </strong>
                        ? All inventory logs and images will also be removed.
                    </div>
                </div>

                {error && (
                    <p className="form-error mb-4">{error}</p>
                )}

                <div className="flex items-center justify-end gap-3">
                    <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={isPending}>
                        Cancel
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={isPending}>
                        {isPending ? "Deleting…" : "Delete Device"}
                    </button>
                </div>
            </div>
        </div>
    );
}