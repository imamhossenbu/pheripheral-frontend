// "use client";

// import React, { useState, useRef } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { motion } from "framer-motion";
// import {
//   User,

//   Camera,
//   KeyRound,
//   Loader2,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import { authService } from "@/lib/api/auth-api";

// export default function ProfilePage() {
//   const { user } = useAuth();
//   console.log(user)
//   const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
//   const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

//   // States
//   const [formData, setFormData] = useState({
//     firstName: user?.firstName || "",
//     lastName: user?.lastName || "",
//     department: user?.department || "",
//   });
//   const [file, setFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(
//     user?.imageUrl || null,
//   );

//   const [passwordData, setPasswordData] = useState({
//     oldPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Profile Update
//   const handleProfileSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsUpdatingProfile(true);

//     const data = new FormData();
//     data.append("firstName", formData.firstName);
//     data.append("lastName", formData.lastName);
//     data.append("department", formData.department);
//     if (file) data.append("file", file);

//     try {
//       await authService.updateProfile(data);
//       toast.success("Profile updated successfully");
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || "Failed to update profile");
//     } finally {
//       setIsUpdatingProfile(false);
//     }
//   };

//   // Password Update
//   const handlePasswordSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (passwordData.newPassword !== passwordData.confirmPassword)
//       return toast.error("Passwords do not match");

//     setIsUpdatingPassword(true);
//     try {
//       await authService.changePassword(
//         passwordData.oldPassword,
//         passwordData.newPassword,
//       );
//       toast.success("Password updated successfully");
//       setPasswordData({
//         oldPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//       });
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || "Password update failed");
//     } finally {
//       setIsUpdatingPassword(false);
//     }
//   };

//   if (!user) return null;

//   return (
//     <div className="min-h-screen bg-surface-50 p-8">
//       <div className="max-w-5xl mx-auto space-y-8">
//         <div>
//           <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">
//             Account Profile
//           </h1>
//           <p className="text-xs font-semibold text-text-secondary mt-1">
//             Configure your registry information and security credentials.
//           </p>
//         </div>

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Profile Form */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="lg:col-span-2 bg-surface-0 p-6 rounded-xl border border-surface-200"
//           >
//             <form onSubmit={handleProfileSubmit} className="space-y-6">
//               <div className="flex items-center gap-6 pb-6 border-b border-surface-100">
//                 <div
//                   className="relative group cursor-pointer"
//                   onClick={() => fileInputRef.current?.click()}
//                 >
//                   <div className="w-20 h-20 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center overflow-hidden">
//                     {previewUrl ? (
//                       <img
//                         src={previewUrl}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <User className="text-brand-500" />
//                     )}
//                   </div>
//                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
//                     <Camera className="text-white w-5 h-5" />
//                   </div>
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     hidden
//                     onChange={(e) => {
//                       const f = e.target.files?.[0];
//                       if (f) {
//                         setFile(f);
//                         setPreviewUrl(URL.createObjectURL(f));
//                       }
//                     }}
//                   />
//                 </div>
//                 <div>
//                   <h3 className="text-xs font-black uppercase text-text-primary">
//                     Profile Avatar
//                   </h3>
//                   <p className="text-[10px] text-text-muted mt-1">
//                     Update your system identifier image.
//                   </p>
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4">
//                 {["firstName", "lastName", "department"].map((field) => (
//                   <div key={field}>
//                     <label className="text-[10px] font-black uppercase text-text-muted">
//                       {field}
//                     </label>
//                     <input
//                       className="w-full p-3 mt-1 rounded-lg border border-surface-200 bg-surface-50 text-xs font-semibold focus:border-brand-500 outline-none"
//                       value={formData[field as keyof typeof formData]}
//                       onChange={(e) =>
//                         setFormData({ ...formData, [field]: e.target.value })
//                       }
//                     />
//                   </div>
//                 ))}
//               </div>
//               <button
//                 disabled={isUpdatingProfile}
//                 className="bg-brand-500 text-surface-0 px-6 py-3 rounded-lg text-xs font-black uppercase hover:bg-brand-600 disabled:bg-surface-200"
//               >
//                 {isUpdatingProfile ? (
//                   <Loader2 className="animate-spin w-4 h-4" />
//                 ) : (
//                   "Update Profile"
//                 )}
//               </button>
//             </form>
//           </motion.div>

//           {/* Password Form */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="bg-surface-0 p-6 rounded-xl border border-surface-200 space-y-4"
//           >
//             <h3 className="text-xs font-black uppercase text-text-primary flex items-center gap-2">
//               <KeyRound className="w-4 h-4 text-brand-500" /> Security
//             </h3>
//             {["oldPassword", "newPassword", "confirmPassword"].map((field) => (
//               <div key={field}>
//                 <label className="text-[10px] font-black uppercase text-text-muted">
//                   {field.replace(/([A-Z])/g, " $1")}
//                 </label>
//                 <input
//                   type="password"
//                   className="w-full p-3 mt-1 rounded-lg border border-surface-200 bg-surface-50 text-xs font-semibold focus:border-brand-500 outline-none"
//                   value={passwordData[field as keyof typeof passwordData]}
//                   onChange={(e) =>
//                     setPasswordData({
//                       ...passwordData,
//                       [field]: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//             ))}
//             <button
//               onClick={handlePasswordSubmit}
//               disabled={isUpdatingPassword}
//               className="w-full bg-brand-500 text-surface-0 py-3 rounded-lg text-xs font-black uppercase hover:bg-brand-600"
//             >
//               {isUpdatingPassword ? (
//                 <Loader2 className="animate-spin w-4 h-4" />
//               ) : (
//                 "Update Password"
//               )}
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { User, Camera, KeyRound, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "@/lib/api/auth-api";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  // States
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    department: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User ডেটা আসা মাত্রই স্টেট আপডেট করা
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        department: user.department || "",
      });
      setPreviewUrl(user.imageUrl || null);
    }
  }, [user]);

  // Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      // AuthContext এর ফাংশন কল করছি যেন সবখানে আপডেট হয়
      await updateProfile(formData, file || undefined);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Password Update
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword)
      return toast.error("Passwords do not match");

    setIsUpdatingPassword(true);
    try {
      await authService.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword,
      );
      toast.success("Password updated successfully");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password update failed");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-surface-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">
            Account Profile
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-surface-0 p-6 rounded-xl border border-surface-200"
          >
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-surface-100">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-20 h-20 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-brand-500" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-5 h-5" />
                  </div>
                  <input
                    type="file"
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
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {["firstName", "lastName", "department"].map((field) => (
                  <div key={field}>
                    <label className="text-[10px] font-black uppercase text-text-muted">
                      {field}
                    </label>
                    <input
                      className="w-full p-3 mt-1 rounded-lg border border-surface-200 bg-surface-50 text-xs font-semibold focus:border-brand-500 outline-none"
                      value={formData[field as keyof typeof formData]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
              <button
                disabled={isUpdatingProfile}
                className="bg-brand-500 text-surface-0 px-6 py-3 rounded-lg text-xs font-black uppercase hover:bg-brand-600"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Update Profile"
                )}
              </button>
            </form>
          </motion.div>

          {/* Password Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-0 p-6 rounded-xl border border-surface-200 space-y-4"
          >
            <h3 className="text-xs font-black uppercase text-text-primary flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand-500" /> Security
            </h3>
            {["oldPassword", "newPassword", "confirmPassword"].map((field) => (
              <div key={field}>
                <label className="text-[10px] font-black uppercase text-text-muted">
                  {field.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  type="password"
                  className="w-full p-3 mt-1 rounded-lg border border-surface-200 bg-surface-50 text-xs font-semibold focus:border-brand-500 outline-none"
                  value={passwordData[field as keyof typeof passwordData]}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      [field]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
            <button
              onClick={handlePasswordSubmit}
              disabled={isUpdatingPassword}
              className="w-full bg-brand-500 text-surface-0 py-3 rounded-lg text-xs font-black uppercase hover:bg-brand-600"
            >
              {isUpdatingPassword ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Update Password"
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
