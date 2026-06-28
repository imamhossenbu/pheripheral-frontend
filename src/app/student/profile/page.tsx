"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  User,
  Camera,
  KeyRound,
  Loader2,
  Mail,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "@/lib/api/auth-api";

// ─── Reusable Input ───────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-xs font-semibold text-text-primary placeholder:text-text-muted focus:border-brand-400 focus:bg-surface-0 outline-none transition-colors pr-9"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            {show ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  // ── Profile fields — alada alada state ──
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");

  // ── Password fields ──
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── Avatar ──
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Loading ──
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // user load হলে fields populate করো
  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setDepartment(user.department ?? "");
    setPreviewUrl(user.imageUrl ?? null);
  }, [user?.id]);

  // ── Handlers ──

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile(
        { firstName, lastName, department },
        file || undefined,
      );

    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");
    if (newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");

    setIsUpdatingPassword(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      toast.success("Password updated");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password update failed");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // ── Loading state ──
  if (!user) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 className="animate-spin w-6 h-6 text-brand-500" />
      </div>
    );
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";

  return (
    <div className="min-h-screen bg-surface-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">
            Account Profile
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage your identity and security credentials.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Profile Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-surface-0 rounded-2xl border border-surface-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-surface-200 bg-surface-50">
              <h2 className="text-xs font-black uppercase text-text-primary flex items-center gap-2">
                <User className="w-4 h-4 text-brand-500" />
                Personal Info
              </h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
              {/* Avatar + user info */}
              <div className="flex items-center gap-5 pb-5 border-b border-surface-100">
                <div
                  className="relative group cursor-pointer shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-2xl bg-surface-100 border border-surface-200 flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-7 h-7 text-brand-300" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-4 h-4" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setFile(f);
                        setPreviewUrl(URL.createObjectURL(f));
                      }
                    }}
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-black text-text-primary">
                    {displayName}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-text-muted" />
                    <p className="text-xs text-text-muted">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-text-muted" />
                    <span className="text-[10px] font-black uppercase text-brand-500">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable fields — alada alada state তাই সব ঠিকঠাক দেখাবে */}
              <div className="grid md:grid-cols-2 gap-4">
                <Field
                  label="First Name"
                  value={firstName}
                  onChange={setFirstName}
                  placeholder="Enter first name"
                />
                <Field
                  label="Last Name"
                  value={lastName}
                  onChange={setLastName}
                  placeholder="Enter last name"
                />
                <div className="md:col-span-2">
                  <Field
                    label="Department"
                    value={department}
                    onChange={setDepartment}
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-colors"
              >
                {isUpdatingProfile && (
                  <Loader2 className="animate-spin w-3.5 h-3.5" />
                )}
                {isUpdatingProfile ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </motion.div>

          {/* ── Password Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-surface-0 rounded-2xl border border-surface-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-surface-200 bg-surface-50">
              <h2 className="text-xs font-black uppercase text-text-primary flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-brand-500" />
                Security
              </h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <Field
                label="Current Password"
                value={oldPassword}
                onChange={setOldPassword}
                type="password"
              />
              <Field
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                type="password"
              />
              <Field
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                type="password"
              />

              {/* Password match indicator */}
              {newPassword && confirmPassword && (
                <p
                  className={`text-[10px] font-bold ${newPassword === confirmPassword ? "text-emerald-500" : "text-red-500"}`}
                >
                  {newPassword === confirmPassword
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </p>
              )}

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-xs font-black uppercase transition-colors"
              >
                {isUpdatingPassword && (
                  <Loader2 className="animate-spin w-3.5 h-3.5" />
                )}
                {isUpdatingPassword ? "Updating…" : "Update Password"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
