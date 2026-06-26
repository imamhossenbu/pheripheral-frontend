"use client";

import { useState, useTransition, useRef } from "react";
import { createDevice, updateDevice } from "@/lib/api/device.api";
import type { Device, Category, CreateDevicePayload, DeviceVariant } from "@/lib/api/device.api";

interface Props {
  device?: Device;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "IN_MAINTENANCE", label: "In Maintenance" },
  { value: "DEPLOYED", label: "Deployed" },
  { value: "RETIRED", label: "Retired" },
] as const;

// variant এর local state type — id থাকলে existing, না থাকলে new
interface VariantRow {
  _key: string;        // local unique key for React
  id?: string;         // existing variant এর id (edit mode)
  name: string;
  sku: string;
  price: string;
  stock: string;
  isActive: boolean;
  specifications: string; // JSON string
}

function newVariantRow(): VariantRow {
  return {
    _key: crypto.randomUUID(),
    name: "",
    sku: "",
    price: "",
    stock: "0",
    isActive: true,
    specifications: "{}",
  };
}

function deviceVariantToRow(v: DeviceVariant): VariantRow {
  return {
    _key: v.id,
    id: v.id,
    name: v.name,
    sku: v.sku ?? "",
    price: v.price != null ? String(v.price) : "",
    stock: String(v.stock),
    isActive: v.isActive,
    specifications: v.specifications ? JSON.stringify(v.specifications, null, 2) : "{}",
  };
}

export default function DeviceFormModal({ device, categories, onClose, onSaved }: Props) {
  const isEdit = !!device;
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    specifications: device?.specifications ? JSON.stringify(device.specifications, null, 2) : "{}",
  });

  // variant rows — edit mode এ device.variants থেকে populate
  const [variants, setVariants] = useState<VariantRow[]>(
    device?.variants && device.variants.length > 0
      ? device.variants.map(deviceVariantToRow)
      : [],
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    device?.images?.find((i) => i.isPrimary)?.url ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [specError, setSpecError] = useState<string | null>(null);
  const [variantErrors, setVariantErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  // ── Variant helpers ───────────────────────────────────────

  function addVariant() {
    setVariants((prev) => [...prev, newVariantRow()]);
  }

  function removeVariant(key: string) {
    setVariants((prev) => prev.filter((v) => v._key !== key));
    setVariantErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function setVariantField(key: string, field: keyof VariantRow, value: any) {
    setVariants((prev) =>
      prev.map((v) => (v._key === key ? { ...v, [field]: value } : v)),
    );
  }

  // ── Validation ────────────────────────────────────────────

  function validateSpec(): Record<string, any> | null {
    try {
      const parsed = JSON.parse(form.specifications);
      setSpecError(null);
      return parsed;
    } catch {
      setSpecError("Specifications must be valid JSON.");
      return null;
    }
  }

  function validateVariants(): { valid: boolean; parsed: any[] } {
    const errors: Record<string, string> = {};
    const parsed: any[] = [];

    for (const v of variants) {
      if (!v.name.trim()) {
        errors[v._key] = "Variant name is required.";
        continue;
      }
      let specs: any = {};
      try {
        specs = JSON.parse(v.specifications || "{}");
      } catch {
        errors[v._key] = "Specifications must be valid JSON.";
        continue;
      }
      parsed.push({
        ...(v.id ? { id: v.id } : {}),
        name: v.name.trim(),
        sku: v.sku.trim() || undefined,
        price: v.price !== "" ? Number(v.price) : undefined,
        stock: Number(v.stock) || 0,
        isActive: v.isActive,
        specifications: specs,
      });
    }

    setVariantErrors(errors);
    return { valid: Object.keys(errors).length === 0, parsed };
  }

  // ── Submit ────────────────────────────────────────────────

  function handleSubmit() {
    setError(null);
    const specs = validateSpec();
    if (!specs) return;
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
          ...(imageFile ? { file: imageFile } : {}),
        };

        if (isEdit) {
          await updateDevice(device.id, payload);
        } else {
          await createDevice(payload);
        }
        onSaved();
      } catch (err: any) {
        setError(err.message ?? "Something went wrong.");
      }
    });
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: "48rem", width: "100%", maxHeight: "92dvh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Upload */}
        <div className="mb-5">
          <label className="form-label">Primary Image</label>
          <div
            className="flex items-center gap-4 p-3 rounded"
            style={{ border: "1px dashed var(--color-surface-300)", background: "var(--color-surface-50)" }}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="rounded object-cover" style={{ width: 64, height: 64 }} />
            ) : (
              <div
                className="rounded flex items-center justify-center"
                style={{ width: 64, height: 64, background: "var(--color-surface-200)", color: "var(--color-text-muted)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>
            )}
            <div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>
                {imagePreview ? "Change Image" : "Upload Image"}
              </button>
              <p className="form-hint mt-1">PNG, JPG up to 5MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
        </div>

        {/* ── Section: Basic Info ── */}
        <SectionLabel>Basic Info</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="mb-4">
          <Field label="Device Name *">
            <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Oscilloscope" />
          </Field>
          <Field label="Brand *">
            <input className="input" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Tektronix" />
          </Field>
          <Field label="Model *">
            <input className="input" value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g. TBS1052B" />
          </Field>
          <Field label="Serial Number *">
            <input className="input" value={form.serialNumber} onChange={(e) => set("serialNumber", e.target.value)} placeholder="e.g. SN-20240001" />
          </Field>
          <Field label="Price (৳) *">
            <input className="input" type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0.00" />
          </Field>
          <Field label="Status">
            <select className="input select" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Category *">
            <select className="input select" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Purchase Date *">
            <input className="input" type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} />
          </Field>
          <Field label="Warranty Expiry *">
            <input className="input" type="date" value={form.warrantyExpiry} onChange={(e) => set("warrantyExpiry", e.target.value)} />
          </Field>
        </div>

        {/* ── Section: Details ── */}
        <SectionLabel>Details</SectionLabel>
        <div className="flex flex-col gap-4 mb-4">
          <Field label="Description *">
            <textarea className="input" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the device…" style={{ resize: "vertical" }} />
          </Field>
          <Field label="Working Principle *">
            <textarea className="input" rows={3} value={form.workingPrinciple} onChange={(e) => set("workingPrinciple", e.target.value)} placeholder="Explain how the device works…" style={{ resize: "vertical" }} />
          </Field>
          <Field label="Specifications (JSON)" error={specError ?? undefined}>
            <textarea
              className={`input ${specError ? "input-error" : ""}`}
              rows={4}
              value={form.specifications}
              onChange={(e) => set("specifications", e.target.value)}
              style={{ resize: "vertical", fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}
            />
          </Field>
        </div>

        {/* ── Section: Variants ── */}
        <div className="flex items-center justify-between mb-3">
          <SectionLabel noMargin>
            Variants
            {variants.length > 0 && (
              <span
                className="badge badge-brand ml-2"
                style={{ fontSize: "var(--font-size-xs)", verticalAlign: "middle" }}
              >
                {variants.length}
              </span>
            )}
          </SectionLabel>
          <button type="button" className="btn btn-secondary btn-xs" onClick={addVariant}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Variant
          </button>
        </div>

        {variants.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-2 rounded mb-5 py-8"
            style={{
              border: "1px dashed var(--color-surface-300)",
              background: "var(--color-surface-50)",
              color: "var(--color-text-muted)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
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

function VariantCard({
  variant,
  index,
  error,
  onChange,
  onRemove,
}: {
  variant: VariantRow;
  index: number;
  error?: string;
  onChange: (field: keyof VariantRow, value: any) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="rounded"
      style={{
        border: error
          ? "1px solid var(--color-danger-500)"
          : "1px solid var(--color-surface-300)",
        background: "var(--color-surface-50)",
        overflow: "hidden",
      }}
    >
      {/* Variant header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: "var(--color-surface-100)",
          borderBottom: expanded ? "1px solid var(--color-surface-300)" : "none",
        }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            style={{ color: "var(--color-text-muted)", lineHeight: 1 }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ transform: expanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <span className="text-label" style={{ color: "var(--color-text-primary)" }}>
            Variant {index + 1}
            {variant.name && (
              <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}> — {variant.name}</span>
            )}
          </span>
          {variant.id && (
            <span className="tag-code" style={{ fontSize: "10px" }}>existing</span>
          )}
          {!variant.isActive && (
            <span className="badge badge-muted" style={{ fontSize: "10px" }}>Inactive</span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-icon btn-xs"
          onClick={onRemove}
          title="Remove variant"
          style={{ color: "var(--color-danger-500)" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Variant body */}
      {expanded && (
        <div className="p-4">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <Field label="Name *">
              <input
                className={`input ${error && !variant.name ? "input-error" : ""}`}
                value={variant.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="e.g. 200MHz, 2-Ch"
              />
            </Field>
            <Field label="SKU">
              <input
                className="input"
                value={variant.sku}
                onChange={(e) => onChange("sku", e.target.value)}
                placeholder="e.g. TBS-200-2CH"
              />
            </Field>
            <Field label="Price (৳)">
              <input
                className="input"
                type="number"
                min={0}
                value={variant.price}
                onChange={(e) => onChange("price", e.target.value)}
                placeholder="Leave blank to inherit"
              />
            </Field>
            <Field label="Stock">
              <input
                className="input"
                type="number"
                min={0}
                value={variant.stock}
                onChange={(e) => onChange("stock", e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Active" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <label
                className="flex items-center gap-2 cursor-pointer"
                style={{ height: "38px", paddingLeft: "0.25rem" }}
              >
                <input
                  type="checkbox"
                  checked={variant.isActive}
                  onChange={(e) => onChange("isActive", e.target.checked)}
                  style={{ accentColor: "var(--color-brand-500)", width: 16, height: 16 }}
                />
                <span className="text-body-sm">Active</span>
              </label>
            </Field>
          </div>

          {/* Variant specs */}
          <div className="mt-3">
            <label className="form-label">Variant Specifications (JSON)</label>
            <textarea
              className={`input ${error?.includes("JSON") ? "input-error" : ""}`}
              rows={3}
              value={variant.specifications}
              onChange={(e) => onChange("specifications", e.target.value)}
              style={{ resize: "vertical", fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}
              placeholder='{"bandwidth": "200MHz", "channels": 2}'
            />
          </div>

          {error && <p className="form-error mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────

function SectionLabel({ children, noMargin }: { children: React.ReactNode; noMargin?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 ${noMargin ? "" : "mb-3"}`}
      style={{ marginTop: noMargin ? 0 : "0.25rem" }}
    >
      <span className="text-overline">{children}</span>
      <div style={{ flex: 1, height: 1, background: "var(--color-surface-300)" }} />
    </div>
  );
}

function Field({
  label,
  children,
  error,
  style,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <label className="form-label">{label}</label>
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}