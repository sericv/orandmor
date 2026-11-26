import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MENU_DEFAULTS } from '../config/cafeConfig';
import type {
  AdminCategory,
  AdminProduct,
  BulkPriceExecutionResult,
  CategoryFormValues,
  ProductFormValues,
} from '../admin/types';

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
  return 9999;
}

function toTimestampMs(value: unknown): number {
  if (
    typeof value === 'object' &&
    value !== null &&
    'seconds' in value &&
    typeof (value as { seconds?: unknown }).seconds === 'number'
  ) {
    return (value as { seconds: number }).seconds * 1000;
  }
  return 0;
}

function formatNumericPrice(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

function mapAdminCategory(
  id: string,
  data: DocumentData,
  cafeId: string
): AdminCategory | null {
  if (data.cafeId !== cafeId) return null;

  return {
    id,
    cafeId,
    name: toCleanString(data.name),
    description: toCleanString(data.description),
    image: typeof data.image === 'string' ? data.image.trim() : '',
    visible: data.visible !== false,
    sortOrder: toSortOrder(data.sortOrder),
    branchIds: Array.isArray(data.branchIds)
      ? data.branchIds.filter((b): b is string => typeof b === 'string')
      : ['all'],
    createdAtMs: toTimestampMs(data.createdAt),
  };
}

function mapAdminProduct(
  id: string,
  data: DocumentData,
  cafeId: string
): AdminProduct | null {
  if (data.cafeId !== cafeId) return null;

  const calories =
    typeof data.calories === 'number' &&
    Number.isFinite(data.calories) &&
    data.calories > 0
      ? data.calories
      : undefined;

  return {
    id,
    cafeId,
    categoryId: toCleanString(data.categoryId),
    name: toCleanString(data.name),
    description: toCleanString(data.description),
    price: toCleanString(data.price),
    image: typeof data.image === 'string' ? data.image.trim() : '',
    visible: data.visible !== false,
    sortOrder: toSortOrder(data.sortOrder),
    isNew: data.isNew === true,
    isPopular: data.isPopular === true,
    mostPopular: data.mostPopular === true,
    calories,
    branchIds: Array.isArray(data.branchIds)
      ? data.branchIds.filter((b): b is string => typeof b === 'string')
      : ['all'],
    optionGroups: Array.isArray(data.optionGroups) ? data.optionGroups : [],
    createdAtMs: toTimestampMs(data.createdAt),
  };
}

export async function fetchAdminMenuData(cafeId: string): Promise<{
  cafeName: string;
  categories: AdminCategory[];
  products: AdminProduct[];
}> {
  const [cafeSnap, categoriesSnap, productsSnap] = await Promise.all([
    getDoc(doc(db, 'cafes', cafeId)),
    getDocs(
      query(collection(db, 'menuCategories'), where('cafeId', '==', cafeId))
    ),
    getDocs(
      query(collection(db, 'menuProducts'), where('cafeId', '==', cafeId))
    ),
  ]);

  const cafeName = cafeSnap.exists()
    ? toCleanString(cafeSnap.data().name) || MENU_DEFAULTS.cafeName
    : MENU_DEFAULTS.cafeName;

  const categories = categoriesSnap.docs
    .map((d) => mapAdminCategory(d.id, d.data(), cafeId))
    .filter((c): c is AdminCategory => c !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const products = productsSnap.docs
    .map((d) => mapAdminProduct(d.id, d.data(), cafeId))
    .filter((p): p is AdminProduct => p !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return { cafeName, categories, products };
}

export async function createAdminProduct(
  cafeId: string,
  values: ProductFormValues,
  nextSortOrder: number
): Promise<AdminProduct> {
  const parsedCalories =
    values.calories.trim() !== '' ? Number(values.calories) : undefined;
  const caloriesValue =
    parsedCalories !== undefined &&
    Number.isFinite(parsedCalories) &&
    parsedCalories >= 0
      ? parsedCalories
      : null;

  const cleanPrice = formatNumericPrice(Number(values.price));

  const payload = {
    cafeId,
    categoryId: values.categoryId,
    name: values.name.trim(),
    price: cleanPrice,
    image: values.image.trim(),
    description: values.description.trim(),
    visible: values.visible,
    sortOrder: nextSortOrder,
    isNew: values.isNew,
    isPopular: values.isPopular,
    mostPopular: values.mostPopular,
    calories: caloriesValue,
    branchIds: ['all'],
    optionGroups: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'menuProducts'), payload);

  return {
    id: docRef.id,
    cafeId,
    categoryId: payload.categoryId,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    image: payload.image,
    visible: payload.visible,
    sortOrder: payload.sortOrder,
    isNew: payload.isNew,
    isPopular: payload.isPopular,
    mostPopular: payload.mostPopular,
    calories: caloriesValue ?? undefined,
    branchIds: payload.branchIds,
    optionGroups: payload.optionGroups,
    createdAtMs: Date.now(),
  };
}

export async function updateAdminProduct(
  productId: string,
  values: ProductFormValues
): Promise<void> {
  const parsedCalories =
    values.calories.trim() !== '' ? Number(values.calories) : undefined;
  const caloriesValue =
    parsedCalories !== undefined &&
    Number.isFinite(parsedCalories) &&
    parsedCalories >= 0
      ? parsedCalories
      : null;

  const cleanPrice = formatNumericPrice(Number(values.price));

  await updateDoc(doc(db, 'menuProducts', productId), {
    categoryId: values.categoryId,
    name: values.name.trim(),
    price: cleanPrice,
    image: values.image.trim(),
    description: values.description.trim(),
    visible: values.visible,
    isNew: values.isNew,
    isPopular: values.isPopular,
    mostPopular: values.mostPopular,
    calories: caloriesValue,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleAdminProductVisibility(
  productId: string,
  visible: boolean
): Promise<void> {
  await updateDoc(doc(db, 'menuProducts', productId), {
    visible,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAdminProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, 'menuProducts', productId));
}

export async function bulkSetProductsVisibility(
  cafeId: string,
  items: { id: string; cafeId: string }[],
  visible: boolean
): Promise<string[]> {
  const CHUNK_SIZE = 400;
  const scopedItems = items.filter((item) => item.cafeId === cafeId);

  for (let i = 0; i < scopedItems.length; i += CHUNK_SIZE) {
    const chunk = scopedItems.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const item of chunk) {
      batch.update(doc(db, 'menuProducts', item.id), {
        visible,
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  }

  return scopedItems.map((item) => item.id);
}

export async function bulkDeleteProducts(
  cafeId: string,
  items: { id: string; cafeId: string }[]
): Promise<string[]> {
  const CHUNK_SIZE = 400;
  const scopedItems = items.filter((item) => item.cafeId === cafeId);

  for (let i = 0; i < scopedItems.length; i += CHUNK_SIZE) {
    const chunk = scopedItems.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const item of chunk) {
      batch.delete(doc(db, 'menuProducts', item.id));
    }

    await batch.commit();
  }

  return scopedItems.map((item) => item.id);
}

export async function createAdminCategory(
  cafeId: string,
  values: CategoryFormValues
): Promise<AdminCategory> {
  const payload = {
    cafeId,
    name: values.name.trim(),
    description: values.description.trim(),
    image: values.image.trim(),
    visible: values.visible,
    sortOrder: values.sortOrder,
    branchIds: ['all'],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'menuCategories'), payload);

  return {
    id: docRef.id,
    cafeId,
    name: payload.name,
    description: payload.description,
    image: payload.image,
    visible: payload.visible,
    sortOrder: payload.sortOrder,
    branchIds: payload.branchIds,
    createdAtMs: Date.now(),
  };
}

export async function updateAdminCategory(
  categoryId: string,
  values: CategoryFormValues
): Promise<void> {
  await updateDoc(doc(db, 'menuCategories', categoryId), {
    name: values.name.trim(),
    description: values.description.trim(),
    image: values.image.trim(),
    visible: values.visible,
    sortOrder: values.sortOrder,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleAdminCategoryVisibility(
  categoryId: string,
  visible: boolean
): Promise<void> {
  await updateDoc(doc(db, 'menuCategories', categoryId), {
    visible,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAdminCategory(categoryId: string): Promise<void> {
  await deleteDoc(doc(db, 'menuCategories', categoryId));
}

/**
 * Safely applies bulk fixed-amount price updates in Firestore Write Batches
 * (chunked at 400 docs/batch, strictly updating ONLY `price` and `updatedAt`
 * on products belonging to `cafeId`). Reports any partial failures accurately.
 */
export async function applyBulkPriceUpdates(
  cafeId: string,
  items: { id: string; name: string; newPrice: number; cafeId: string }[]
): Promise<BulkPriceExecutionResult> {
  const CHUNK_SIZE = 400;
  const scopedItems = items.filter((item) => item.cafeId === cafeId);

  let succeededCount = 0;
  const failedItems: { id: string; name: string; reason: string }[] = [];

  for (let i = 0; i < scopedItems.length; i += CHUNK_SIZE) {
    const chunk = scopedItems.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const item of chunk) {
      batch.update(doc(db, 'menuProducts', item.id), {
        price: formatNumericPrice(item.newPrice),
        updatedAt: serverTimestamp(),
      });
    }

    try {
      await batch.commit();
      succeededCount += chunk.length;
    } catch (batchErr) {
      // Fallback per-item inside failed chunk to identify exact failing products
      for (const item of chunk) {
        try {
          await updateDoc(doc(db, 'menuProducts', item.id), {
            price: formatNumericPrice(item.newPrice),
            updatedAt: serverTimestamp(),
          });
          succeededCount += 1;
        } catch (itemErr) {
          failedItems.push({
            id: item.id,
            name: item.name,
            reason:
              itemErr instanceof Error
                ? itemErr.message
                : batchErr instanceof Error
                  ? batchErr.message
                  : 'فشل التحديث',
          });
        }
      }
    }
  }

  return { succeededCount, failedItems };
}
