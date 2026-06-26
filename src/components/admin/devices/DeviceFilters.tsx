"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useRef, useEffect } from "react";
import type { DeviceStatus } from "@/lib/api/device.api";
import type { CategoryTree } from "@/lib/api/category.api";
import { FiSearch, FiFolder, FiFolderPlus, FiChevronDown, FiChevronRight } from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────

interface Props {
    categories: CategoryTree[];
}

const STATUS_OPTIONS: { value: DeviceStatus | ""; label: string }[] = [
    { value: "", label: "All Statuses" },
    { value: "AVAILABLE", label: "Available" },
    { value: "IN_MAINTENANCE", label: "Maintenance" },
    { value: "DEPLOYED", label: "Deployed" },
    { value: "RETIRED", label: "Retired" },
];

// ─── Category Tree Helpers ────────────────────────────────

function findNode(nodes: CategoryTree[], id: string): CategoryTree | null {
    for (const n of nodes) {
        if (n.id === id) return n;
        const found = findNode(n.subCategories ?? [], id);
        if (found) return found;
    }
    return null;
}

function nodeMatchesFilter(node: CategoryTree, q: string): boolean {
    if (!q) return true;
    if (node.name.toLowerCase().includes(q)) return true;
    return (node.subCategories ?? []).some((c) => nodeMatchesFilter(c, q));
}

// ─── NodeRow ──────────────────────────────────────────────

function NodeRow({
    node,
    selectedId,
    expanded,
    filterText,
    onSelect,
    onToggle,
}: {
    node: CategoryTree;
    selectedId: string | null;
    expanded: Set<string>;
    filterText: string;
    onSelect: (id: string) => void;
    onToggle: (id: string) => void;
}) {
    const q = filterText.toLowerCase();
    if (!nodeMatchesFilter(node, q)) return null;

    const kids = node.subCategories ?? [];
    const hasKids = kids.length > 0;
    const isExp = expanded.has(node.id) || (!!q && hasKids);
    const isSel = selectedId === node.id;

    return (
        <div>
            <div
                className="flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer text-sm select-none"
                style={{
                    background: isSel ? "var(--color-accent-50, #eff6ff)" : undefined,
                    color: isSel
                        ? "var(--color-accent-600, #2563eb)"
                        : "var(--color-text-primary)",
                }}
                onMouseEnter={(e) => {
                    if (!isSel)
                        e.currentTarget.style.background = "var(--color-surface-50, #f9fafb)";
                }}
                onMouseLeave={(e) => {
                    if (!isSel) e.currentTarget.style.background = "";
                }}
                onClick={() => onSelect(node.id)}
            >
                {/* Expand toggle */}
                {hasKids ? (
                    <button
                        style={{
                            width: 16,
                            height: 16,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-text-muted)",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle(node.id);
                        }}
                    >
                        {isExp
                            ? <FiChevronDown size={12} />
                            : <FiChevronRight size={12} />
                        }
                    </button>
                ) : (
                    <span style={{ width: 16, flexShrink: 0 }} />
                )}

                {/* Folder icon */}
                {hasKids
                    ? <FiFolderPlus
                        size={13}
                        style={{
                            flexShrink: 0,
                            color: isSel ? "var(--color-accent-500, #3b82f6)" : "var(--color-text-muted)",
                        }}
                    />
                    : <FiFolder
                        size={13}
                        style={{
                            flexShrink: 0,
                            color: isSel ? "var(--color-accent-500, #3b82f6)" : "var(--color-text-muted)",
                        }}
                    />
                }

                <span className="flex-1 truncate">{node.name}</span>
            </div>

            {hasKids && isExp && (
                <div
                    style={{
                        paddingLeft: "0.75rem",
                        borderLeft: "1px solid var(--color-border, #e5e7eb)",
                        marginLeft: "0.5rem",
                    }}
                >
                    {kids.map((child) => (
                        <NodeRow
                            key={child.id}
                            node={child}
                            selectedId={selectedId}
                            expanded={expanded}
                            filterText={filterText}
                            onSelect={onSelect}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── CategoryTreeFilter ───────────────────────────────────

function CategoryTreeFilter({
    categories,
    value,
    onChange,
}: {
    categories: CategoryTree[];
    value: string;
    onChange: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [filterText, setFilterText] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selectedNode = value ? findNode(categories, value) : null;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (open) setTimeout(() => searchRef.current?.focus(), 50);
    }, [open]);

    const toggleExpand = (id: string) =>
        setExpanded((prev) => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });

    const select = (id: string) => {
        onChange(value === id ? "" : id);
        setOpen(false);
        setFilterText("");
    };

    return (
        <div ref={ref} style={{ position: "relative" }}>
            {/* Trigger */}
            <button
                className="input select"
                style={{
                    width: 180,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textAlign: "left",
                    cursor: "pointer",
                }}
                onClick={() => setOpen((v) => !v)}
            >
                <span
                    style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 13,
                    }}
                >
                    {selectedNode?.name ?? "All Categories"}
                </span>
            
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: 0,
                        width: 230,
                        background: "white",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md, 8px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        zIndex: 9999,
                        padding: 6,
                    }}
                >
                    {/* Search */}
                    <input
                        ref={searchRef}
                        className="input"
                        style={{ width: "100%", fontSize: 12, marginBottom: 4 }}
                        placeholder="Filter categories…"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />

                    <div style={{ maxHeight: 220, overflowY: "auto" }}>
                        {/* All option */}
                        <div
                            className="flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer text-sm select-none"
                            style={{
                                background: !value ? "var(--color-accent-50, #eff6ff)" : undefined,
                                color: !value
                                    ? "var(--color-accent-600, #2563eb)"
                                    : "var(--color-text-muted)",
                                fontStyle: "italic",
                            }}
                            onMouseEnter={(e) => {
                                if (value)
                                    e.currentTarget.style.background = "var(--color-surface-50, #f9fafb)";
                            }}
                            onMouseLeave={(e) => {
                                if (value) e.currentTarget.style.background = "";
                            }}
                            onClick={() => {
                                onChange("");
                                setOpen(false);
                            }}
                        >
                            <span style={{ width: 16 }} />
                            <span>All categories</span>
                        </div>

                        {categories.map((node) => (
                            <NodeRow
                                key={node.id}
                                node={node}
                                selectedId={value || null}
                                expanded={expanded}
                                filterText={filterText}
                                onSelect={select}
                                onToggle={toggleExpand}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── DeviceFilters (main export) ──────────────────────────

export default function DeviceFilters({ categories }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const update = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            params.delete("page");
            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
            });
        },
        [router, pathname, searchParams],
    );

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
                <FiSearch
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                />
                <input
                    className="input pl-9"
                    style={{ width: 220 }}
                    placeholder="Search devices…"
                    defaultValue={searchParams.get("search") ?? ""}
                    onChange={(e) => update("search", e.target.value)}
                />
            </div>

            {/* Status */}
            <select
                className="input select focus:outline-none "
                style={{ width: 160 }}
                value={searchParams.get("status") ?? ""}
                onChange={(e) => update("status", e.target.value)}
            >
                {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>

            {/* Category tree */}
            <CategoryTreeFilter
                categories={categories}
                value={searchParams.get("categoryId") ?? ""}
                onChange={(id) => update("categoryId", id)}
            />

            {isPending && (
                <span className="text-caption" style={{ color: "var(--color-text-muted)" }}>
                    Filtering…
                </span>
            )}
        </div>
    );
}