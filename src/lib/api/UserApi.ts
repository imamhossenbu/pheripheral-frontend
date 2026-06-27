import { fetchAPI, serverFetchAPI } from "@/lib/api";

const isServer = typeof window === "undefined";

export const userService = {
  getAll: (query: string) => {
    return isServer
      ? serverFetchAPI(`/users?${query}`)
      : fetchAPI(`/users?${query}`);
  },

  getOne: (id: string) => {
    return isServer ? serverFetchAPI(`/users/${id}`) : fetchAPI(`/users/${id}`);
  },

  create: (data: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    department?: string;
    role: "ADMIN" | "STAFF" | "STUDENT";
  }) => {
    return fetchAPI("/users", {
      method: "POST",
      data,
    });
  },

  update: (
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      department: string;
      role: "ADMIN" | "STAFF" | "STUDENT";
      isVerified: boolean;
    }>,
  ) => {
    return fetchAPI(`/users/${id}`, {
      method: "PATCH",
      data,
    });
  },

  delete: (id: string) => {
    return fetchAPI(`/users/${id}`, {
      method: "DELETE",
    });
  },
};
