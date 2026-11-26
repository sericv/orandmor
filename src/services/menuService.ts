import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MENU_DEFAULTS } from '../config/cafeConfig';
import type {
  CafeMenuData,
  CafeProfile,
  MenuCategory,
  MenuProduct,
} from '../types/menu';

function toCleanString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function toSortOrder(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Number.MAX_SAFE_INTEGER;
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function isDocumentActiveAndVisible(data: DocumentData): boolean {
  // Respect `visible` (actual schema field) and defensively respect `active` if present
  if (data.visible === false) return false;
  if (data.active === false) return false;
  return data.visible === true || data.active === true;
}

function formatPrice(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed;
  }
  return '';
}

function mapCategory(
  id: string,
  data: DocumentData,
  expectedCafeId: string
): MenuCategory | null {
  if (data.cafeId !== expectedCafeId) return null;
  if (!isDocumentActiveAndVisible(data)) return null;

  const name = toCleanString(data.name);
  if (!name) return null;

  return {
    id,
    cafeId: expectedCafeId,
    name,
    description: toCleanString(data.description),
    image: typeof data.image === 'string' ? data.image.trim() : '',
    visible: true,
    sortOrder: toSortOrder(data.sortOrder),
    branchIds: toStringArray(data.branchIds),
  };
}

function mapProduct(
  id: string,
  data: DocumentData,
  expectedCafeId: string
): MenuProduct | null {
  if (data.cafeId !== expectedCafeId) return null;
  if (!isDocumentActiveAndVisible(data)) return null;

  const name = toCleanString(data.name);
  if (!name) return null;

  const calories =
    typeof data.calories === 'number' &&
    Number.isFinite(data.calories) &&
    data.calories > 0
      ? data.calories
      : undefined;

  return {
    id,
    cafeId: expectedCafeId,
    categoryId: toCleanString(data.categoryId),
    name,
    description: toCleanString(data.description),
    price: formatPrice(data.price),
    currency: MENU_DEFAULTS.currency,
    image: typeof data.image === 'string' ? data.image.trim() : '',
    visible: true,
    sortOrder: toSortOrder(data.sortOrder),
    isNew: toBoolean(data.isNew),
    isPopular: toBoolean(data.isPopular),
    mostPopular: toBoolean(data.mostPopular),
    calories,
    branchIds: toStringArray(data.branchIds),
  };
}

// In-memory cache & in-flight deduplication so Firestore is queried only once per cafeId
const menuCache = new Map<string, CafeMenuData>();
const inFlightRequests = new Map<string, Promise<CafeMenuData>>();

/**
 * Read-only fetch for a single café's profile, visible categories, and visible products.
 * Strictly isolated by `cafeId` at both the Firestore query level and client mapping level.
 * Results are cached in memory to prevent redundant Firestore reads during navigation.
 */
export async function fetchCafeMenu(
  cafeId: string,
  options?: { forceRefresh?: boolean }
): Promise<CafeMenuData> {
  if (!options?.forceRefresh) {
    const cached = menuCache.get(cafeId);
    if (cached) return cached;

    const pending = inFlightRequests.get(cafeId);
    if (pending) return pending;
  }

  const request = (async (): Promise<CafeMenuData> => {
    const cafeRef = doc(db, 'cafes', cafeId);
    const categoriesQuery = query(
      collection(db, 'menuCategories'),
      where('cafeId', '==', cafeId)
    );
    const productsQuery = query(
      collection(db, 'menuProducts'),
      where('cafeId', '==', cafeId)
    );

    const [cafeSnap, categoriesSnap, productsSnap] = await Promise.all([
      getDoc(cafeRef),
      getDocs(categoriesQuery),
      getDocs(productsQuery),
    ]);

    let cafe: CafeProfile | null = null;
    if (cafeSnap.exists()) {
      const cafeData = cafeSnap.data();
      cafe = {
        id: cafeSnap.id,
        name: toCleanString(cafeData.name) || MENU_DEFAULTS.cafeName,
        active: cafeData.active !== false,
      };
    }

    // If the café itself is explicitly disabled, do not expose its menu items
    if (cafe && !cafe.active) {
      const inactiveResult: CafeMenuData = { cafe, categories: [], products: [] };
      menuCache.set(cafeId, inactiveResult);
      return inactiveResult;
    }

    const categories = categoriesSnap.docs
      .map((d) => mapCategory(d.id, d.data(), cafeId))
      .filter((cat): cat is MenuCategory => cat !== null)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const visibleCategoryIds = new Set(categories.map((c) => c.id));

    const products = productsSnap.docs
      .map((d) => mapProduct(d.id, d.data(), cafeId))
      .filter((prod): prod is MenuProduct => {
        if (!prod) return false;
        if (visibleCategoryIds.size > 0 && prod.categoryId) {
          return visibleCategoryIds.has(prod.categoryId);
        }
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const result: CafeMenuData = { cafe, categories, products };
    menuCache.set(cafeId, result);
    return result;
  })();

  inFlightRequests.set(cafeId, request);

  try {
    return await request;
  } finally {
    inFlightRequests.delete(cafeId);
  }
}
