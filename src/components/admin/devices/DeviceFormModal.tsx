"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { createDevice, updateDevice } from "@/lib/api/device.api";
import type { Device, Category, CreateDevicePayload, DeviceVariant } from "@/lib/api/device.api";
import type { CategoryTree } from "@/lib/api/category.api";
import { FiChevronDown, FiChevronRight, FiFolder, FiFolderPlus, FiX, FiPlus, FiUpload, FiSearch } from "react-icons/fi";

interface Props {
  device?: Device;
  categories: CategoryTree[];
  onClose: () => void;
  onSaved: () => void;
  onError?: (msg: string) => void;
}

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "IN_MAINTENANCE", label: "In Maintenance" },
  { value: "DEPLOYED", label: "Deployed" },
  { value: "RETIRED", label: "Retired" },
] as const;

// ─── Helper functions for Category Tree ───────────────────

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

// ─── Variant types ────────────────────────────────────────

interface VariantRow {
  _key: string;
  id?: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
  isActive: boolean;
  specifications: { key: string; value: string }[];
}

function newVariantRow(): VariantRow {
  return {
    _key: crypto.randomUUID(),
    name: "",
    sku: "",
    price: "",
    stock: "0",
    isActive: true,
    specifications: [],
  };
}

function deviceVariantToRow(v: DeviceVariant): VariantRow {
  const specs = v.specifications && typeof v.specifications === "object"
    ? Object.entries(v.specifications).map(([k, val]) => ({
      key: k,
      value: typeof val === "object" ? JSON.stringify(val) : String(val),
    }))
    : [];

  return {
    _key: v.id,
    id: v.id,
    name: v.name,
    sku: v.sku ?? "",
    price: v.price != null ? String(v.price) : "",
    stock: String(v.stock),
    isActive: v.isActive,
    specifications: specs,
  };
}

// ─── Image types ──────────────────────────────────────────

interface ImageRow {
  _key: string;
  file: File;
  preview: string;
  isPrimary: boolean;
}

// ─── Main Component ───────────────────────────────────────

export default function DeviceFormModal({ device, categories, onClose, onSaved, onError }: Props) {
  const isEdit = !!device;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiImageRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: device?.name ?? "",
    brand: device?.brand ?? "",
    model: device?.model ?? "",
    serialNumber: device?.serialNumber ?? "",
    price: device?.price != null ? String(device.price) : "",
    status: device?.status ?? "AVAILABLE",
    description: device?.description ?? "",
    workingPrinciple: device?.workingPrinciple ?? "",
    purchaseDate: device?.purchaseDate ? device.purchaseDate.slice(0, 10) : "",
    warrantyExpiry: device?.warrantyExpiry ? device.warrantyExpiry.slice(0, 10) : "",
    categoryId: device?.categoryId ?? "",
  });

  const [deviceSpecs, setDeviceSpecs] = useState<{ key: string; value: string }[]>(() => {
    if (!device?.specifications) return [];
    return Object.entries(device.specifications).map(([k, v]) => ({
      key: k,
      value: typeof v === "object" ? JSON.stringify(v) : String(v),
    }));
  });

  const [variants, setVariants] = useState<VariantRow[]>(
    device?.variants?.length ? device.variants.map(deviceVariantToRow) : [],
  );

  // Primary image
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(
    device?.images?.find(i => i.isPrimary)?.url ?? null,
  );

  // Additional images
  const [additionalImages, setAdditionalImages] = useState<ImageRow[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [variantErrors, setVariantErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // ── Image handlers ─────────────────────────────────────

  function handlePrimaryImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPrimaryFile(file);
    setPrimaryPreview(URL.createObjectURL(file));
  }

  function handleAdditionalImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const rows: ImageRow[] = files.map(file => ({
      _key: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      isPrimary: false,
    }));
    setAdditionalImages(prev => [...prev, ...rows]);
    e.target.value = "";
  }

  function removeAdditionalImage(key: string) {
    setAdditionalImages(prev => prev.filter(i => i._key !== key));
  }

  // ── Variant helpers ────────────────────────────────────

  function addVariant() {
    setVariants(prev => [...prev, newVariantRow()]);
  }

  function removeVariant(key: string) {
    setVariants(prev => prev.filter(v => v._key !== key));
    setVariantErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  function setVariantField(key: string, field: keyof VariantRow, value: any) {
    setVariants(prev => prev.map(v => v._key === key ? { ...v, [field]: value } : v));
  }

  // ── Validation ─────────────────────────────────────────

  function getSpecsObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    deviceSpecs.forEach(pair => {
      const k = pair.key.trim();
      const v = pair.value.trim();
      if (k) {
        obj[k] = v;
      }
    });
    return obj;
  }

  function validateVariants(): { valid: boolean; parsed: any[] } {
    const errors: Record<string, string> = {};
    const parsed: any[] = [];

    for (const v of variants) {
      if (!v.name.trim()) {
        errors[v._key] = "Variant name is required.";
        continue;
      }

      const specsObj: Record<string, any> = {};
      v.specifications.forEach(item => {
        const k = item.key.trim();
        const val = item.value.trim();
        if (k) {
          specsObj[k] = val;
        }
      });

      parsed.push({
        ...(v.id ? { id: v.id } : {}),
        name: v.name.trim(),
        ...(v.sku ? { sku: v.sku.trim() } : {}),
        ...(v.price !== "" ? { price: Number(v.price) } : {}),
        stock: Number(v.stock) || 0,
        isActive: v.isActive,
        specifications: specsObj,
      });
    }

    setVariantErrors(errors);
    return { valid: Object.keys(errors).length === 0, parsed };
  }

  // ── Submit ─────────────────────────────────────────────

  function handleSubmit() {
    setError(null);
    const specs = getSpecsObject();
    const { valid, parsed: parsedVariants } = validateVariants();
    if (!valid) return;

    startTransition(async () => {
      try {
        const payload: CreateDevicePayload = {
          name: form.name,
          brand: form.brand,
          model: form.model,
          serialNumber: form.serialNumber,
          price: Number(form.price),
          status: form.status as any,
          description: form.description,
          workingPrinciple: form.workingPrinciple,
          purchaseDate: form.purchaseDate,
          warrantyExpiry: form.warrantyExpiry,
          categoryId: form.categoryId,
          specifications: specs,
          variants: parsedVariants,
          ...(primaryFile ? { file: primaryFile } : {}),
          ...(additionalImages.length > 0 && {
            files: additionalImages.map(img => img.file),
          }),
        };

        if (isEdit) {
          await updateDevice(device.id, payload);
        } else {
          await createDevice(payload);
        }
        onSaved();
      } catch (err: any) {
        const msg = err.message ?? "Something went wrong.";
        setError(msg);
        onError?.(msg);
      }
    });
  }

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: "52rem", width: "100%", maxHeight: "92dvh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-heading-sm">{isEdit ? "Edit Device" : "Add New Device"}</h2>
            <p className="text-body-sm" style={{ color: "var(--color-text-muted)" }}>
              {isEdit ? `Editing ${device.name}` : "Fill in the details to register a new device."}
            </p>
          </div>
          <button className="btn btn-icon" onClick={onClose} aria-label="Close">
            <FiX size={16} />
          </button>
        </div>

        {/* ── Images ── */}
        <SectionLabel>Images</SectionLabel>
        <div className="mb-5">
          {/* Primary image */}
          <label className="form-label">Primary Image</label>
          <div
            className="flex items-center gap-4 p-3 rounded mb-3"
            style={{ border: "1px dashed var(--color-surface-300)", background: "var(--color-surface-50)" }}
          >
            {primaryPreview ? (
              <img src={primaryPreview} alt="primary" className="rounded object-cover flex-shrink-0" style={{ width: 64, height: 64 }} />
            ) : (
              <div className="rounded flex items-center justify-center flex-shrink-0" style={{ width: 64, height: 64, background: "var(--color-surface-200)", color: "var(--color-text-muted)" }}>
                <FiUpload size={20} />
              </div>
            )}
            <div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>
                {primaryPreview ? "Change Image" : "Upload Primary Image"}
              </button>
              <p className="form-hint mt-1">PNG, JPG up to 5MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePrimaryImage} />
          </div>

          {/* Additional images */}
          <label className="form-label">Additional Images</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {additionalImages.map(img => (
              <div key={img._key} className="relative" style={{ width: 64, height: 64 }}>
                <img src={img.preview} alt="" className="rounded object-cover w-full h-full" style={{ border: "1px solid var(--color-surface-300)" }} />
                <button
                  type="button"
                  onClick={() => removeAdditionalImage(img._key)}
                  className="absolute -top-1 -right-1 rounded-full flex items-center justify-center"
                  style={{ width: 18, height: 18, background: "var(--color-danger-500)", color: "#fff", fontSize: 10 }}
                >
                  <FiX size={10} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => multiImageRef.current?.click()}
              className="rounded flex items-center justify-center flex-shrink-0"
              style={{ width: 64, height: 64, border: "1px dashed var(--color-surface-300)", background: "var(--color-surface-50)", color: "var(--color-text-muted)", cursor: "pointer" }}
            >
              <FiPlus size={20} />
            </button>
            <input ref={multiImageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAdditionalImages} />
          </div>
        </div>

        {/* ── Basic Info ── */}
        <SectionLabel>Basic Info</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="mb-4">
          <Field label="Device Name *">
            <input className="input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Oscilloscope" />
          </Field>
          <Field label="Brand *">
            <input className="input" value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="e.g. Tektronix" />
          </Field>
          <Field label="Model *">
            <input className="input" value={form.model} onChange={e => set("model", e.target.value)} placeholder="e.g. TBS1052B" />
          </Field>
          <Field label="Serial Number *">
            <input className="input" value={form.serialNumber} onChange={e => set("serialNumber", e.target.value)} placeholder="e.g. SN-20240001" />
          </Field>
          <Field label="Price (৳) *">
            <input className="input" type="number" min={0} value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" />
          </Field>
          <Field label="Status">
            <select className="input select" value={form.status} onChange={e => set("status", e.target.value)}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          {/* Category Selector Tree */}
          <Field label="Category *">
            <CategoryTreeFormSelect
              categories={categories}
              value={form.categoryId}
              onChange={id => set("categoryId", id)}
            />
          </Field>

          <Field label="Purchase Date *">
            <input className="input" type="date" value={form.purchaseDate} onChange={e => set("purchaseDate", e.target.value)} />
          </Field>
          <Field label="Warranty Expiry *">
            <input className="input" type="date" value={form.warrantyExpiry} onChange={e => set("warrantyExpiry", e.target.value)} />
          </Field>
        </div>

        {/* ── Details ── */}
        <SectionLabel>Details</SectionLabel>
        <div className="flex flex-col gap-4 mb-4">
          <Field label="Description *">
            <textarea className="input" rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the device…" style={{ resize: "vertical" }} />
          </Field>
          <Field label="Working Principle *">
            <textarea className="input" rows={3} value={form.workingPrinciple} onChange={e => set("workingPrinciple", e.target.value)} placeholder="Explain how the device works…" style={{ resize: "vertical" }} />
          </Field>

          {/* Key-Value Specifications Editor */}
          <KeyValueEditor
            label="Specifications"
            specs={deviceSpecs}
            onChange={setDeviceSpecs}
          />
        </div>

        {/* ── Variants ── */}
        <div className="flex items-center justify-between mb-3">
          <SectionLabel noMargin>
            Variants
            {variants.length > 0 && (
              <span className="badge badge-brand ml-2" style={{ fontSize: "var(--font-size-xs)", verticalAlign: "middle" }}>
                {variants.length}
              </span>
            )}
          </SectionLabel>
          <button type="button" className="btn btn-secondary btn-xs" onClick={addVariant}>
            <FiPlus size={12} /> Add Variant
          </button>
        </div>

        {variants.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded mb-5 py-8" style={{ border: "1px dashed var(--color-surface-300)", background: "var(--color-surface-50)", color: "var(--color-text-muted)" }}>
            <p className="text-body-sm">No variants yet. Add one if this device has multiple configurations.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-5">
            {variants.map((v, idx) => (
              <VariantCard
                key={v._key}
                variant={v}
                index={idx}
                error={variantErrors[v._key]}
                onChange={(field, val) => setVariantField(v._key, field, val)}
                onRemove={() => removeVariant(v._key)}
              />
            ))}
          </div>
        )}

        {error && <p className="form-error mb-4">{error}</p>}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: "1px solid var(--color-surface-300)" }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={isPending}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save Changes" : "Add Device"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── VariantCard ───────────────────────────────────────────

function VariantCard({ variant, index, error, onChange, onRemove }: {
  variant: VariantRow;
  index: number;
  error?: string;
  onChange: (field: keyof VariantRow, value: any) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded" style={{ border: error ? "1px solid var(--color-danger-500)" : "1px solid var(--color-surface-300)", background: "var(--color-surface-50)", overflow: "hidden" }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ background: "var(--color-surface-100)", borderBottom: expanded ? "1px solid var(--color-surface-300)" : "none" }}>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setExpanded(p => !p)} style={{ color: "var(--color-text-muted)" }}>
            <FiChevronDown size={14} style={{ transform: expanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
          </button>
          <span className="text-label" style={{ color: "var(--color-text-primary)" }}>
            Variant {index + 1}
            {variant.name && <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}> — {variant.name}</span>}
          </span>
          {variant.id && <span className="tag-code" style={{ fontSize: "10px" }}>existing</span>}
          {!variant.isActive && <span className="badge badge-muted" style={{ fontSize: "10px" }}>Inactive</span>}
        </div>
        <button type="button" className="btn btn-icon btn-xs" onClick={onRemove} style={{ color: "var(--color-danger-500)" }}>
          <FiX size={13} />
        </button>
      </div>

      {expanded && (
        <div className="p-4">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }} className="mb-3">
            <Field label="Name *">
              <input className={`input ${error && !variant.name ? "input-error" : ""}`} value={variant.name} onChange={e => onChange("name", e.target.value)} placeholder="e.g. 200MHz, 2-Ch" />
            </Field>
            <Field label="SKU">
              <input className="input" value={variant.sku} onChange={e => onChange("sku", e.target.value)} placeholder="e.g. TBS-200-2CH" />
            </Field>
            <Field label="Price (৳)">
              <input className="input" type="number" min={0} value={variant.price} onChange={e => onChange("price", e.target.value)} placeholder="Inherit from device" />
            </Field>
            <Field label="Stock *">
              <input className="input" type="number" min={0} value={variant.stock} onChange={e => onChange("stock", e.target.value)} placeholder="0" />
            </Field>
            <Field label="Active" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <label className="flex items-center gap-2 cursor-pointer" style={{ height: "38px", paddingLeft: "0.25rem" }}>
                <input type="checkbox" checked={variant.isActive} onChange={e => onChange("isActive", e.target.checked)} style={{ accentColor: "var(--color-brand-500)", width: 16, height: 16 }} />
                <span className="text-body-sm">Active</span>
              </label>
            </Field>
          </div>

          {/* Key-Value Variant Specifications Editor */}
          <KeyValueEditor
            label="Specifications"
            specs={variant.specifications}
            onChange={newSpecs => onChange("specifications", newSpecs)}
          />

          {error && <p className="form-error mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ── Key-Value Specifications Editor Component ─────────────

function KeyValueEditor({
  specs,
  onChange,
  label,
}: {
  specs: { key: string; value: string }[];
  onChange: (specs: { key: string; value: string }[]) => void;
  label: string;
}) {
  const addPair = () => {
    onChange([...specs, { key: "", value: "" }]);
  };

  const removePair = (index: number) => {
    onChange(specs.filter((_, idx) => idx !== index));
  };

  const updatePair = (index: number, field: "key" | "value", val: string) => {
    onChange(
      specs.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
    );
  };

  return (
    <div className="mb-4">
      <label className="form-label" style={{ fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{label}</span>
      </label>
      {specs.length === 0 ? (
        <div className="p-3 text-center text-xs italic rounded" style={{ background: "var(--color-surface-50)", border: "1px dashed var(--color-surface-300)", color: "var(--color-text-muted)" }}>
          No specifications added yet. Click "Add Specification" to add details.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {specs.map((item, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr auto", gap: "0.5rem", alignItems: "center" }}>
              <input
                className="input text-xs"
                placeholder="Key (e.g. Dimensions)"
                value={item.key}
                onChange={(e) => updatePair(idx, "key", e.target.value)}
              />
              <input
                className="input text-xs"
                placeholder="Value (e.g. 10x20 cm)"
                value={item.value}
                onChange={(e) => updatePair(idx, "value", e.target.value)}
              />
              <button
                type="button"
                className="btn btn-icon btn-xs"
                onClick={() => removePair(idx)}
                style={{ color: "var(--color-danger-500)", minWidth: "32px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        className="btn btn-secondary btn-xs mt-2"
        onClick={addPair}
        style={{ display: "flex", alignItems: "center", gap: "4px" }}
      >
        <FiPlus size={12} /> Add Specification
      </button>
    </div>
  );
}

// ── CategoryTreeFormSelect Component ──────────────────────

interface CategorySelectProps {
  categories: CategoryTree[];
  value: string;
  onChange: (id: string) => void;
}

function CategoryTreeFormSelect({ categories, value, onChange }: CategorySelectProps) {
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
    onChange(id);
    setOpen(false);
    setFilterText("");
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger Button */}
      <button
        type="button"
        className="input select"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          background: "#fff",
          textAlign: "left"
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate" style={{ fontSize: 13, color: selectedNode ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
          {selectedNode?.name ?? "Select category…"}
        </span>
        <FiChevronDown size={14} style={{ color: "var(--color-text-muted)", marginLeft: "auto" }} />
      </button>

      {/* Floating Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            width: "100%",
            background: "white",
            border: "1px solid var(--color-surface-300)",
            borderRadius: "var(--radius-md, 8px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 9999,
            padding: 6,
          }}
        >
          {/* Filter Search */}
          <div className="relative mb-2">
            <FiSearch
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-muted)" }}
            />
            <input
              ref={searchRef}
              className="input"
              style={{ width: "100%", fontSize: 12, paddingLeft: "1.8rem", height: "30px" }}
              placeholder="Filter categories…"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>

          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {categories.map((node) => (
              <NodeRowForm
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

function NodeRowForm({
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
        className="flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer text-sm select-none"
        style={{
          background: isSel ? "var(--color-accent-50, #eff6ff)" : undefined,
          color: isSel ? "var(--color-accent-600, #2563eb)" : "var(--color-text-primary)",
        }}
        onMouseEnter={(e) => {
          if (!isSel) e.currentTarget.style.background = "var(--color-surface-50)";
        }}
        onMouseLeave={(e) => {
          if (!isSel) e.currentTarget.style.background = "";
        }}
        onClick={() => onSelect(node.id)}
      >
        {/* Expand icon */}
        {hasKids ? (
          <button
            type="button"
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
            {isExp ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
          </button>
        ) : (
          <span style={{ width: 16, flexShrink: 0 }} />
        )}

        {/* Folder icon */}
        {hasKids ? (
          <FiFolderPlus
            size={13}
            style={{
              flexShrink: 0,
              color: isSel ? "var(--color-accent-500)" : "var(--color-text-muted)",
            }}
          />
        ) : (
          <FiFolder
            size={13}
            style={{
              flexShrink: 0,
              color: isSel ? "var(--color-accent-500)" : "var(--color-text-muted)",
            }}
          />
        )}

        <span className="flex-1 truncate" style={{ fontSize: 13 }}>{node.name}</span>
      </div>

      {hasKids && isExp && (
        <div
          style={{
            paddingLeft: "0.75rem",
            borderLeft: "1px solid var(--color-surface-200)",
            marginLeft: "0.5rem",
          }}
        >
          {kids.map((child) => (
            <NodeRowForm
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

// ── Helpers ───────────────────────────────────────────────

function SectionLabel({ children, noMargin }: { children: React.ReactNode; noMargin?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${noMargin ? "" : "mb-3"}`} style={{ marginTop: noMargin ? 0 : "0.25rem" }}>
      <span className="text-overline">{children}</span>
      <div style={{ flex: 1, height: 1, background: "var(--color-surface-300)" }} />
    </div>
  );
}

function Field({ label, children, error, style }: { label: string; children: React.ReactNode; error?: string; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label className="form-label">{label}</label>
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}