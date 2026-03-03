/**
 * TypeScript interfaces for Category data model
 */

export interface Category {
  id: number;
  name: string;
  description: string | null;
  parentCategoryId: number | null;
  parentCategoryName: string | null;
}

export interface CategoryTree {
  id: number;
  name: string;
  description: string | null;
  children: CategoryTree[];
}

export interface CreateCategoryRequest {
  name: string;
  description: string | null;
  parentCategoryId: number | null;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string | null;
  parentCategoryId: number | null;
}
