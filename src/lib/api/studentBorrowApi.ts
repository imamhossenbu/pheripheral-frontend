/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetchAPI, fetchAPI } from "@/lib/api";
import { PaginatedBorrowResponse } from "./borrowApi";

export const studentBorrowApi = {
  // সার্ভার সাইড থেকে স্টুডেন্টের নিজের রিকোয়েস্টগুলো আনা
  getMyRequestsServer: (page: number = 1, limit: number = 10) => {
    return serverFetchAPI<PaginatedBorrowResponse>(
      `/borrow-requests/my-requests?page=${page}&limit=${limit}`,
      {
        method: "GET",
      },
    );
  },

  // এক্সটেনশন (সময় বাড়ানোর) রিকোয়েস্ট পাঠানো
  requestExtension: (dto: {
    borrowRequestId: string;
    requestedEndDate: string;
    reason: string;
  }) => {
    return fetchAPI<any>("/borrow-requests/extensions", {
      method: "POST",
      data: dto,
    });
  },
};
