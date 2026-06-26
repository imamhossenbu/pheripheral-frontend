import { Suspense } from "react";
import { getCategoryTree, getCategories } from "@/lib/api/category.api";
import CategoryTree from "@/components/admin/categoy/CategoryTree";

export default async function AdminCategoriesPage() {
  const [tree, flat] = await Promise.all([
    getCategoryTree(),
    getCategories(),
  ]);

  return (
    <div className="dashboard-content">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-overline mb-1">Inventory</p>
        <h1 className="text-heading-lg">Categories</h1>
        <p className="text-body-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Organise devices into a hierarchy. Devices cannot be added without a category.
        </p>
      </div>

      <hr className="divider mb-5" />

      {/* Info banner if no categories */}
      {tree.length === 0 && (
        <div className="alert alert-info mb-5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>No categories exist yet. Create at least one before adding devices.</span>
        </div>
      )}

      {/* Tree — stats live inside, updates on every add/edit/delete */}
      <Suspense fallback={<TreeSkeleton />}>
        <CategoryTree initialTree={tree} initialFlat={flat} />
      </Suspense>
    </div>
  );
}

function TreeSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: 44,
            borderRadius: "var(--radius-sm)",
            marginLeft: i % 3 === 0 ? 0 : i % 3 === 1 ? "1.5rem" : "3rem",
          }}
        />
      ))}
    </div>
  );
}