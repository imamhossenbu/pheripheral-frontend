import { fetchAPI } from "@/lib/api"; 

// ─── TYPES ────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export interface CategoryTree extends Category {
  subCategories: CategoryTree[];
  devices?: {
    id: string;
    name: string;
    brand: string;
    model: string;
    status: string;
  }[];
}

export interface CreateCategoryPayload {
  name: string;
  parentId?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  parentId?: string;
}

// ─── API FUNCTIONS ────────────────────────────────────────

// flat list — device form এ select এ use করতে
export async function getCategories(): Promise<Category[]> {
  return fetchAPI<Category[]>("/categories");
}

// tree — admin page এ use করতে
export async function getCategoryTree(): Promise<CategoryTree[]> {
  return fetchAPI<CategoryTree[]>("/categories?tree=true");
}

export async function getCategory(id: string): Promise<CategoryTree> {
  return fetchAPI<CategoryTree>(`/categories/${id}`);
}

export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<Category> {
  return fetchAPI<Category>("/categories", {
    method: "POST",
    data: payload,
  });
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  return fetchAPI<Category>(`/categories/${id}`, {
    method: "PATCH",
    data: payload,
  });
}

export async function deleteCategory(
  id: string,
): Promise<{ message: string; id: string }> {
  return fetchAPI(`/categories/${id}`, { method: "DELETE" });
}
