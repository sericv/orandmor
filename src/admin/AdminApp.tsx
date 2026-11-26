import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ACTIVE_CAFE_ID, MENU_DEFAULTS } from '../config/cafeConfig';
import {
  signOutAdmin,
  type AdminUser,
} from '../services/adminAuthService';
import {
  applyBulkPriceUpdates,
  bulkDeleteProducts,
  bulkSetProductsVisibility,
  createAdminCategory,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminProduct,
  fetchAdminMenuData,
  toggleAdminCategoryVisibility,
  toggleAdminProductVisibility,
  updateAdminCategory,
  updateAdminProduct,
} from '../services/adminMenuService';
import type {
  AdminCategory,
  AdminProduct,
  AdminSection,
  BulkPriceExecutionResult,
  CategoryFormValues,
  ProductFormValues,
} from './types';
import { AdminLogin } from './components/AdminLogin';
import { AdminLayout } from './components/AdminLayout';
import { DashboardOverview } from './components/DashboardOverview';
import { ProductsManager } from './components/ProductsManager';
import { CategoriesManager } from './components/CategoriesManager';
import { BulkPriceManager } from './components/BulkPriceManager';
import { AdminGuidePage } from './components/AdminGuidePage';
import { ProductFormModal } from './components/ProductFormModal';
import { CategoryFormModal } from './components/CategoryFormModal';

export default function AdminApp() {
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [cafeName, setCafeName] = useState<string>(MENU_DEFAULTS.cafeName);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Product modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null
  );
  const [savingProduct, setSavingProduct] = useState(false);

  // Category modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null
  );
  const [savingCategory, setSavingCategory] = useState(false);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current));
    }, 3200);
  }, []);

  useEffect(() => {
    document.title = `لوحة التحكم | ${cafeName}`;
  }, [cafeName]);

  // Listen to Firebase Auth state directly (any authenticated Firebase Auth user may enter)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminUser({ email: user.email ?? '' });
      } else {
        setAdminUser(null);
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const loadAdminData = useCallback(async () => {
    setDataLoading(true);
    try {
      const data = await fetchAdminMenuData(ACTIVE_CAFE_ID);
      setCafeName(data.cafeName);
      setCategories(data.categories);
      setProducts(data.products);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminUser) {
      loadAdminData();
    }
  }, [adminUser, loadAdminData]);

  const handleSignOut = async () => {
    await signOutAdmin();
    setAdminUser(null);
    setActiveSection('overview');
  };

  // --- Product Handlers ---
  const handleSaveProduct = async (values: ProductFormValues) => {
    setSavingProduct(true);
    try {
      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, values);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: values.name.trim(),
                  price: values.price.trim(),
                  categoryId: values.categoryId,
                  image: values.image.trim(),
                  description: values.description.trim(),
                  calories:
                    values.calories.trim() !== ''
                      ? Number(values.calories)
                      : undefined,
                  isNew: values.isNew,
                  isPopular: values.isPopular,
                  mostPopular: values.mostPopular,
                  visible: values.visible,
                }
              : p
          )
        );
        showToast('تم حفظ تعديلات المنتج بنجاح.');
      } else {
        const maxSort = products.reduce(
          (max, p) => (p.sortOrder < 9000 && p.sortOrder > max ? p.sortOrder : max),
          0
        );
        const created = await createAdminProduct(
          ACTIVE_CAFE_ID,
          values,
          maxSort + 1
        );
        setProducts((prev) => [...prev, created]);
        showToast('تمت إضافة المنتج بنجاح.');
      }
      setProductModalOpen(false);
      setEditingProduct(null);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleToggleProductVisible = async (
    product: AdminProduct,
    visible: boolean
  ) => {
    await toggleAdminProductVisibility(product.id, visible);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, visible } : p))
    );
  };

  const handleDeleteProduct = async (product: AdminProduct) => {
    await deleteAdminProduct(product.id);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    showToast('تم حذف المنتج.');
  };

  const handleBulkSetProductsVisible = async (
    targetProducts: AdminProduct[],
    visible: boolean
  ) => {
    const updatedIds = await bulkSetProductsVisibility(
      ACTIVE_CAFE_ID,
      targetProducts,
      visible
    );
    const updatedSet = new Set(updatedIds);
    setProducts((prev) =>
      prev.map((p) => (updatedSet.has(p.id) ? { ...p, visible } : p))
    );
    showToast(
      visible
        ? `تم إظهار ${updatedIds.length} منتج في المنيو.`
        : `تم إخفاء ${updatedIds.length} منتج من المنيو.`
    );
  };

  const handleBulkDeleteProducts = async (targetProducts: AdminProduct[]) => {
    const deletedIds = await bulkDeleteProducts(ACTIVE_CAFE_ID, targetProducts);
    const deletedSet = new Set(deletedIds);
    setProducts((prev) => prev.filter((p) => !deletedSet.has(p.id)));
    showToast(`تم حذف ${deletedIds.length} منتج بنجاح.`);
  };

  // --- Category Handlers ---
  const handleSaveCategory = async (values: CategoryFormValues) => {
    setSavingCategory(true);
    try {
      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, values);
        setCategories((prev) =>
          prev
            .map((c) =>
              c.id === editingCategory.id
                ? {
                    ...c,
                    name: values.name.trim(),
                    description: values.description.trim(),
                    image: values.image.trim(),
                    sortOrder: values.sortOrder,
                    visible: values.visible,
                  }
                : c
            )
            .sort((a, b) => a.sortOrder - b.sortOrder)
        );
        showToast('تم تحديث التصنيف بنجاح.');
      } else {
        const created = await createAdminCategory(ACTIVE_CAFE_ID, values);
        setCategories((prev) =>
          [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder)
        );
        showToast('تمت إضافة التصنيف بنجاح.');
      }
      setCategoryModalOpen(false);
      setEditingCategory(null);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleToggleCategoryVisible = async (
    category: AdminCategory,
    visible: boolean
  ) => {
    await toggleAdminCategoryVisibility(category.id, visible);
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? { ...c, visible } : c))
    );
  };

  const handleDeleteCategory = async (category: AdminCategory) => {
    await deleteAdminCategory(category.id);
    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    showToast('تم حذف التصنيف.');
  };

  // --- Bulk Price Handler ---
  const handleApplyBulkPrices = async (
    updates: { id: string; name: string; newPrice: number; cafeId: string }[]
  ): Promise<BulkPriceExecutionResult> => {
    const result = await applyBulkPriceUpdates(ACTIVE_CAFE_ID, updates);
    const failedIds = new Set(result.failedItems.map((f) => f.id));
    const priceMap = new Map(
      updates
        .filter((u) => !failedIds.has(u.id))
        .map((u) => [
          u.id,
          Number.isInteger(u.newPrice)
            ? String(u.newPrice)
            : u.newPrice.toFixed(2),
        ])
    );

    setProducts((prev) =>
      prev.map((p) =>
        priceMap.has(p.id) ? { ...p, price: priceMap.get(p.id)! } : p
      )
    );

    return result;
  };

  if (authChecking) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--bg-canvas)] text-[var(--text-secondary)]">
        <p className="text-[14.5px] font-medium">جاري التحميل...</p>
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLogin onSuccess={(user) => setAdminUser(user)} />;
  }

  const nextCategorySortOrder =
    categories.reduce(
      (max, c) => (c.sortOrder < 9000 && c.sortOrder > max ? c.sortOrder : max),
      0
    ) + 1;

  return (
    <AdminLayout
      cafeName={cafeName}
      adminEmail={adminUser.email}
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      onSignOut={handleSignOut}
    >
      {dataLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-[20px] bg-[var(--bg-subtle)]"
              />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-[22px] bg-[var(--bg-subtle)]" />
        </div>
      ) : (
        <>
          {activeSection === 'overview' && (
            <DashboardOverview
              categories={categories}
              products={products}
              onNavigate={setActiveSection}
              onEditProduct={(product) => {
                setEditingProduct(product);
                setProductModalOpen(true);
              }}
            />
          )}

          {activeSection === 'products' && (
            <ProductsManager
              categories={categories}
              products={products}
              onAddClick={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              onEditClick={(product) => {
                setEditingProduct(product);
                setProductModalOpen(true);
              }}
              onToggleVisible={handleToggleProductVisible}
              onDelete={handleDeleteProduct}
              onBulkSetVisible={handleBulkSetProductsVisible}
              onBulkDelete={handleBulkDeleteProducts}
            />
          )}

          {activeSection === 'categories' && (
            <CategoriesManager
              categories={categories}
              products={products}
              onAddClick={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              onEditClick={(category) => {
                setEditingCategory(category);
                setCategoryModalOpen(true);
              }}
              onToggleVisible={handleToggleCategoryVisible}
              onDelete={handleDeleteCategory}
            />
          )}

          {activeSection === 'prices' && (
            <BulkPriceManager
              products={products}
              onApplyBulkPrices={handleApplyBulkPrices}
            />
          )}

          {activeSection === 'guide' && <AdminGuidePage cafeName={cafeName} />}
        </>
      )}

      {/* Modals */}
      <ProductFormModal
        open={productModalOpen}
        product={editingProduct}
        categories={categories}
        saving={savingProduct}
        onSave={handleSaveProduct}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
      />

      <CategoryFormModal
        open={categoryModalOpen}
        category={editingCategory}
        defaultSortOrder={nextCategorySortOrder}
        saving={savingCategory}
        onSave={handleSaveCategory}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
      />

      {/* Lightweight Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--bg-featured)] px-5 py-2.5 text-[13.5px] font-medium text-[#FDF9F3] shadow-xl content-fade-in"
        >
          {toast}
        </div>
      )}
    </AdminLayout>
  );
}
