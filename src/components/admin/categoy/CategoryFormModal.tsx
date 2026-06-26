"use client";

import { useState, useTransition } from "react";
import { createCategory, updateCategory } from "@/lib/api/category.api";
import type { Category, CategoryTree } from "@/lib/api/category.api";

interface Props {
    // edit mode হলে category থাকবে
    category?: CategoryTree;
    // "Add subcategory" করলে pre-selected parent
    defaultParentId?: string;
    // flat list — parent select এ লাগবে
    allCategories: Category[];
    onClose: () => void;
    onSaved: () => void;
}

export default function CategoryFormModal({
    category,
    defaultParentId,
    allCategories,
    onClose,
    onSaved,
}: Props) {
    const isEdit = !!category;

    const [name, setName] = useState(category?.name ?? "");
    const [parentId, setParentId] = useState<string>(
        category?.parentId ?? defaultParentId ?? "",
    );
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // edit mode তে নিজেকে এবং নিজের descendants কে parent হিসেবে দেখাবে না
    // (simple filter — backend cycle check আছেই, এটা just UX)
    const editingId = category?.id;
    const parentOptions = allCategories.filter((c) => c.id !== editingId);

    function handleSubmit() {
        if (!name.trim()) {
            setError("Category name is required.");
            return;
        }
        setError(null);

        startTransition(async () => {
            try {
                const payload = {
                    name: name.trim(),
                    ...(parentId ? { parentId } : {}),
                };

                if (isEdit) {
                    await updateCategory(category.id, payload);
                } else {
                    await createCategory(payload);
                }
                onSaved();
            } catch (err: any) {
                setError(err.message ?? "Something went wrong.");
            }
        });
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: "26rem" }} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-heading-sm">
                            {isEdit ? "Edit Category" : "New Category"}
                        </h2>
                        <p className="text-body-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                            {isEdit ? `Editing "${category.name}"` : "Add a new equipment category."}
                        </p>
                    </div>
                    <button className="btn btn-icon" onClick={onClose} aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Name */}
                    <div>
                        <label className="form-label">Category Name *</label>
                        <input
                            className={`input ${error && !name.trim() ? "input-error" : ""}`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Measurement Instruments"
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                    </div>

                    {/* Parent */}
                    <div>
                        <label className="form-label">Parent Category</label>
                        <select
                            className="input select"
                            value={parentId}
                            onChange={(e) => setParentId(e.target.value)}
                        >
                            <option value="">— Root (no parent) —</option>
                            {parentOptions.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <p className="form-hint">Leave blank to make this a top-level category.</p>
                    </div>
                </div>

                {error && <p className="form-error mt-3">{error}</p>}

                <div className="flex items-center justify-end gap-3 mt-6">
                    <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={isPending}>
                        Cancel
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={isPending}>
                        {isPending
                            ? isEdit ? "Saving…" : "Creating…"
                            : isEdit ? "Save Changes" : "Create Category"}
                    </button>
                </div>
            </div>
        </div>
    );
}