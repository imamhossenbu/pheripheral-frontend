"use client";

import { useState, useTransition } from "react";
import { deleteCategory } from "@/lib/api/category.api";
import type { CategoryTree } from "@/lib/api/category.api";

interface Props {
    category: CategoryTree;
    onClose: () => void;
    onDeleted: () => void;
}

export default function CategoryDeleteModal({ category, onClose, onDeleted }: Props) {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const hasChildren = category.subCategories?.length > 0;
    const hasDevices = (category.devices?.length ?? 0) > 0;
    const canDelete = !hasChildren && !hasDevices;

    function handleDelete() {
        setError(null);
        startTransition(async () => {
            try {
                await deleteCategory(category.id);
                onDeleted();
            } catch (err: any) {
                setError(err.message ?? "Failed to delete category.");
            }
        });
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: "28rem" }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-heading-sm">Delete Category</h2>
                        <p className="text-body-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                            This cannot be undone.
                        </p>
                    </div>
                    <button className="btn btn-icon" onClick={onClose} aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {!canDelete ? (
                    <div className="alert alert-warning mb-5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <div className="flex flex-col gap-1">
                            <strong>Cannot delete "{category.name}"</strong>
                            {hasChildren && <span>It has {category.subCategories.length} subcategory(ies). Delete or reassign them first.</span>}
                            {hasDevices && <span>It has {category.devices?.length} device(s). Move or delete them first.</span>}
                        </div>
                    </div>
                ) : (
                    <div className="alert alert-danger mb-5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>
                            Delete category <strong>"{category.name}"</strong>? This action is permanent.
                        </span>
                    </div>
                )}

                {error && <p className="form-error mb-4">{error}</p>}

                <div className="flex items-center justify-end gap-3">
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
                    {canDelete && (
                        <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={isPending}>
                            {isPending ? "Deleting…" : "Delete Category"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}