import { api } from "../api";

export const authService = {
  updateProfile: async (data: FormData) => {
    return await api.patch("/auth/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    return await api.post("/auth/change-password", {
      oldPassword,
      newPassword,
    });
  },
};
