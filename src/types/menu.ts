export type CategoryFilterId = 'all' | string;
export type ProductViewMode = 'grid' | 'list';

export interface CafeProfile {
  id: string;
  name: string;
  active: boolean;
}

export interface MenuCategory {
  id: string;
  cafeId: string;
  name: string;
  description: string;
  image: string;
  visible: boolean;
  sortOrder: number;
  branchIds: string[];
}

export interface MenuProduct {
  id: string;
  cafeId: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  image: string;
  visible: boolean;
  sortOrder: number;
  isNew: boolean;
  isPopular: boolean;
  mostPopular: boolean;
  calories?: number;
  branchIds: string[];
}

export interface CafeMenuData {
  cafe: CafeProfile | null;
  categories: MenuCategory[];
  products: MenuProduct[];
}
