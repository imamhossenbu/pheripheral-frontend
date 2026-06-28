/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Users,
  GraduationCap,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { userService } from "@/lib/api/UserApi";

type Role = "ADMIN" | "STAFF" | "STUDENT";

const ROLES: {
  value: Role;
  label: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  {
    value: "STUDENT",
    label: "Student",
    icon: <GraduationCap className="w-4 h-4" />,
    desc: "Can browse and borrow devices",
  },
  {
    value: "STAFF",
    label: "Staff",
    icon: <Users className="w-4 h-4" />,
    desc: "Can manage orders and inventory",
  },
  {
    value: "ADMIN",
    label: "Admin",
    icon: <Shield className="w-4 h-4" />,
    desc: "Full system access",
  },
];

interface Props {
  onClose: () => void;
}

export function CreateUserModal({ onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    department: "",
    role: "STUDENT" as Role,
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email";
    if (!form.password) e.password = "Required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    startTransition(async () => {
      try {
        await userService.create({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim() || undefined,
          email: form.email.trim(),
          password: form.password,
          department: form.department.trim() || undefined,
          role: form.role,
        });
        toast.success("User created successfully");
        router.refresh();
        onClose();
      } catch (err: any) {
        toast.error(err.message || "Failed to create user");
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
        {/* Added `max-h-[calc(100vh-2rem)] flex flex-col` so the card fits safely within the viewport */}
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[calc(100vh-2rem)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Create User
                </h2>
                <p className="text-xs text-slate-400">
                  Add a new account manually
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body -> Added `overflow-y-auto flex-1` to handle the vertical scrollbar correctly */}
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  First name <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  placeholder="Rahim"
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white text-slate-800 placeholder-slate-300 outline-none transition-colors focus:ring-2 focus:ring-slate-200 ${
                    errors.firstName ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-[11px] text-red-400 mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Last name
                </label>
                <input
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  placeholder="Uddin"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-300 outline-none focus:ring-2 focus:ring-slate-200 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="rahim@university.edu"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white text-slate-800 placeholder-slate-300 outline-none transition-colors focus:ring-2 focus:ring-slate-200 ${
                  errors.email ? "border-red-300" : "border-slate-200"
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Min. 6 characters"
                  className={`w-full px-3 py-2 pr-9 text-sm rounded-lg border bg-white text-slate-800 placeholder-slate-300 outline-none transition-colors focus:ring-2 focus:ring-slate-200 ${
                    errors.password ? "border-red-300" : "border-slate-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-400 mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Department
              </label>
              <input
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-300 outline-none focus:ring-2 focus:ring-slate-200 transition-colors"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Role <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => set("role", r.value)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-center transition-all ${
                      form.role === r.value
                        ? "border-slate-800 bg-slate-800 text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {r.icon}
                    <span className="text-xs font-semibold">{r.label}</span>
                    <span
                      className={`text-[10px] leading-tight ${form.role === r.value ? "text-slate-300" : "text-slate-400"}`}
                    >
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create User
            </button>
          </div>
        </div>
      </div>
    </>
  );
}