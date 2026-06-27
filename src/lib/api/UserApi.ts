import { fetchAPI, serverFetchAPI } from "@/lib/api";

// হেল্পার ফাংশন: কোডটি সার্ভারে রান হচ্ছে নাকি ক্লায়েন্টে তা চেক করার জন্য
const isServer = typeof window === "undefined";

export const userService = {
  // সার্ভার বা ক্লায়েন্ট যেখানেই কল হোক, সঠিক API মেথড চুজ করবে
  getAll: (query: string) => {
    return isServer
      ? serverFetchAPI(`/users?${query}`)
      : fetchAPI(`/users?${query}`);
  },

  getOne: (id: string) => {
    return isServer ? serverFetchAPI(`/users/${id}`) : fetchAPI(`/users/${id}`);
  },

  update: (id: string, data: any) => {
    // Axios-এ বডি ডাটা পাঠানোর জন্য 'data' কী (key) ব্যবহার করতে হয়
    return fetchAPI(`/users/${id}`, {
      method: "PATCH",
      data: data, // স্পষ্ট করে data পাস করা হলো
    });
  },

  delete: (id: string) => {
    return fetchAPI(`/users/${id}`, {
      method: "DELETE",
    });
  },
};
