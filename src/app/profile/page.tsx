/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";

import { useAuth } from "@/context/AuthContext";
import { fetchAPI } from "@/lib/api";
import { motion } from "framer-motion";
import {
  User,
  Briefcase,
  Mail,
  Lock,
  Upload,
  KeyRound,
  Loader2,
  ShieldCheck,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  // Profile Info Form States
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.imageUrl || null,
  );
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile(
        {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          department: department || undefined,
        },
        file,
      );
    } catch (err) {
      // Toast notifications handled by context
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetchAPI("/auth/change-password", {
        method: "POST",
        data: { oldPassword, newPassword },
      });
      toast.success(res.message || "Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-brand-pale/5 dark:bg-[#080d19]">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white tracking-tight">
            Account Profile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Configure your personal information, department tags, and login
            security credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Details Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-2xl border border-brand-pale dark:border-brand-dark/20 p-6 shadow-xl shadow-brand-pale/10 dark:shadow-none space-y-8"
          >
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0 pb-6 border-b border-gray-100 dark:border-gray-800">
                {/* Avatar Preview & Input */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-brand-blue/10 dark:bg-brand-blue/20 overflow-hidden flex items-center justify-center border-2 border-brand-pale dark:border-brand-dark/30 group-hover:border-brand-blue transition-colors">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-brand-blue" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-brand-blue hover:bg-brand-dark text-white p-2 rounded-xl shadow-lg border border-white dark:border-gray-900 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-lg font-bold text-brand-dark dark:text-white">
                    Profile Photo
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                    Upload an avatar image. Cloudinary handles formatting
                    automatically.
                  </p>
                  {file && (
                    <span className="inline-block mt-2 px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-md text-xxs font-semibold">
                      New image selected
                    </span>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    First Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Last Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Engineering / Sales / Support"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-brand-blue hover:bg-brand-dark text-white font-bold py-2.5 px-6 rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-brand-blue/10 disabled:opacity-50 text-sm"
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Right Column: Password Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#111827] rounded-2xl border border-brand-pale dark:border-brand-dark/20 p-6 shadow-xl shadow-brand-pale/10 dark:shadow-none space-y-6"
          >
            <div>
              <h3 className="text-lg font-bold text-brand-dark dark:text-white flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-brand-blue animate-pulse" />
                <span>Change Password</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Maintain standard security policies by regularly modifying your
                password credentials.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  New Password (Min 6)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full bg-brand-blue hover:bg-brand-dark text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 text-xs mt-2"
              >
                {isUpdatingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
