/**
 * TypeScript interfaces for Product data model
 */

export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  quantity: number;
  categoryId: number | null;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string | null;
  sku: string;
  price: number;
  quantity: number;
  categoryId: number | null;
}

export interface UpdateProductRequest {
  name: string;
  description: string | null;
  sku: string;
  price: number;
  quantity: number;
  categoryId: number | null;
}

export interface ProductSearchResult {
  product: Product;
  searchScore: number;
}
