"use client";

import { useState, useTransition, useCallback } from "react";
import { getCategoryTree, getCategories } from "@/lib/api/category.api";
import type { Category, CategoryTree as CategoryTreeType } from "@/lib/api/category.api";
import CategoryFormModal from "./CategoryFormModal";
import CategoryDeleteModal from "./CategoryDeleteModal";

interface Props {
  initialTree: CategoryTreeType[];
  initialFlat: Category[];
}

export default function CategoryTree({ initialTree, initialFlat }: Props) {
  const [tree, setTree] = useState<CategoryTreeType[]>(initialTree);
  const [flat, setFlat] = useState<Category[]>(initialFlat);
  const [isPending, startTransition] = useTransition();

  // Modal state
  const [createModal, setCreateModal] = useState<{ defaultParentId?: string } | null>(null);
  const [editModal, setEditModal] = useState<CategoryTreeType | null>(null);
  const [deleteModal, setDeleteModal] = useState<CategoryTreeType | null>(null);

  const refresh = useCallback(() => {
    startTransition(async () => {
      const [freshTree, freshFlat] = await Promise.all([
        getCategoryTree(),
        getCategories(),
      ]);
      setTree(freshTree);
      setFlat(freshFlat);
    });
  }, []);

  function handleSaved() {
    setCreateModal(null);
    setEditModal(null);
    refresh();
  }

  function handleDeleted() {
    setDeleteModal(null);
    refresh();
  }

  // count total across all levels
  function countAll(nodes: CategoryTreeType[]): number {
    return nodes.reduce((acc, n) => acc + 1 + countAll(n.subCategories ?? []), 0);
  }

  const totalCount = countAll(tree);
  const rootCount = tree.length;
  const leafCount = totalCount - tree.filter((n) => (n.subCategories?.length ?? 0) > 0).length;

  return (
    <>
      {/* Stats */}
      <div className="flex items-center gap-3 mb-5">
        <StatChip label="Total" value={totalCount} />
        <StatChip label="Root" value={rootCount} />
        <StatChip label="Leaf" value={leafCount} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-body-sm" style={{ color: "var(--color-text-muted)" }}>
          {totalCount} categor{totalCount === 1 ? "y" : "ies"} total
        </p>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setCreateModal({})}
          disabled={isPending}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Category
        </button>
      </div>

      {/* Tree */}
      <div
        className="card-flat"
        style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.15s" }}
      >
        {tree.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-2 py-14"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-body-sm">No categories yet.</p>
            <button className="btn btn-secondary btn-xs mt-1" onClick={() => setCreateModal({})}>
              Create your first category
            </button>
          </div>
        ) : (
          <div>
            {tree.map((node, idx) => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                isLast={idx === tree.length - 1}
                onEdit={setEditModal}
                onDelete={setDeleteModal}
                onAddChild={(parentId) => setCreateModal({ defaultParentId: parentId })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {createModal !== null && (
        <CategoryFormModal
          defaultParentId={createModal.defaultParentId}
          allCategories={flat}
          onClose={() => setCreateModal(null)}
          onSaved={handleSaved}
        />
      )}
      {editModal && (
        <CategoryFormModal
          category={editModal}
          allCategories={flat}
          onClose={() => setEditModal(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteModal && (
        <CategoryDeleteModal
          category={deleteModal}
          onClose={() => setDeleteModal(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}

// ── StatChip ──────────────────────────────────────────────

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card" style={{ padding: "0.5rem 1rem", minWidth: 72, textAlign: "center" }}>
      <p className="stat-value" style={{ fontSize: "var(--font-size-xl)" }}>
        {value}
      </p>
      <p className="stat-label">{label}</p>
    </div>
  );
}

// ── TreeNode ──────────────────────────────────────────────

function TreeNode({
  node,
  depth,
  isLast,
  onEdit,
  onDelete,
  onAddChild,
}: {
  node: CategoryTreeType;
  depth: number;
  isLast: boolean;
  onEdit: (n: CategoryTreeType) => void;
  onDelete: (n: CategoryTreeType) => void;
  onAddChild: (parentId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.subCategories?.length > 0;
  const deviceCount = node.devices?.length ?? 0;

  // count all descendants
  function countDescendants(n: CategoryTreeType): number {
    return (n.subCategories ?? []).reduce(
      (acc, child) => acc + 1 + countDescendants(child),
      0,
    );
  }
  const descendantCount = countDescendants(node);

  return (
    <div>
      <div
        className="flex items-center gap-2 group"
        style={{
          paddingLeft: `${depth * 1.5 + 1}rem`,
          paddingRight: "1rem",
          paddingTop: "0.6rem",
          paddingBottom: "0.6rem",
          borderBottom: isLast && !hasChildren ? "none" : "1px solid var(--color-surface-200)",
          transition: "background-color 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-50)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
      >
        {/* Collapse toggle or spacer */}
        <button
          onClick={() => hasChildren && setCollapsed((p) => !p)}
          style={{
            width: 20,
            height: 20,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: hasChildren ? "var(--color-text-muted)" : "transparent",
            cursor: hasChildren ? "pointer" : "default",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Folder icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{
            flexShrink: 0,
            color: depth === 0 ? "var(--color-brand-500)" : "var(--color-accent-500)",
          }}
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>

        {/* Name */}
        <span
          className="text-label flex-1 truncate"
          style={{ color: "var(--color-text-primary)" }}
        >
          {node.name}
        </span>

        {/* Badges */}
        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          {deviceCount > 0 && (
            <span className="badge badge-info" title={`${deviceCount} device(s)`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
              </svg>
              {deviceCount}
            </span>
          )}
          {descendantCount > 0 && (
            <span className="badge badge-muted" title={`${descendantCount} subcategory(ies)`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              {descendantCount}
            </span>
          )}
        </div>

        {/* Actions — visible on hover */}
        <div
          className="flex items-center gap-1"
          style={{
            opacity: 0,
            transition: "opacity 0.12s",
          }}
          ref={(el) => {
            if (!el) return;
            const row = el.closest(".group") as HTMLElement | null;
            if (!row) return;
            const show = () => (el.style.opacity = "1");
            const hide = () => (el.style.opacity = "0");
            row.addEventListener("mouseenter", show);
            row.addEventListener("mouseleave", hide);
          }}
        >
          {/* Add child */}
          <button
            className="btn btn-icon btn-xs"
            title="Add subcategory"
            onClick={() => onAddChild(node.id)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          {/* Edit */}
          <button
            className="btn btn-icon btn-xs"
            title="Edit"
            onClick={() => onEdit(node)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          {/* Delete */}
          <button
            className="btn btn-icon btn-xs"
            title="Delete"
            onClick={() => onDelete(node)}
            style={{ color: "var(--color-danger-500)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div
          style={{
            borderLeft: `2px solid var(--color-surface-200)`,
            marginLeft: `${depth * 1.5 + 1.75}rem`,
          }}
        >
          {node.subCategories.map((child, idx) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isLast={idx === node.subCategories.length - 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}