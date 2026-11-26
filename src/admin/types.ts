export type AdminSection =
  | 'overview'
  | 'products'
  | 'categories'
  | 'prices'
  | 'guide';

export interface AdminCategory {
  id: string;
  cafeId: string;
  name: string;
  description: string;
  image: string;
  visible: boolean;
  sortOrder: number;
  branchIds: string[];
  createdAtMs: number;
}

export interface AdminProduct {
  id: string;
  cafeId: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  image: string;
  visible: boolean;
  sortOrder: number;
  isNew: boolean;
  isPopular: boolean;
  mostPopular: boolean;
  calories?: number;
  branchIds: string[];
  optionGroups: unknown[];
  createdAtMs: number;
}

export interface ProductFormValues {
  name: string;
  price: string;
  categoryId: string;
  image: string;
  description: string;
  calories: string;
  isNew: boolean;
  isPopular: boolean;
  mostPopular: boolean;
  visible: boolean;
}

export interface CategoryFormValues {
  name: string;
  description: string;
  image: string;
  sortOrder: number;
  visible: boolean;
}

export type BulkPriceOperation = 'increase' | 'decrease';

export interface BulkPricePreviewItem {
  id: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  isInvalid: boolean;
}

export interface BulkPriceExecutionResult {
  succeededCount: number;
  failedItems: { id: string; name: string; reason: string }[];
}
