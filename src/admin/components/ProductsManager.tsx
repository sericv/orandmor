import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { SaudiRiyalSymbol } from '../../components/SaudiRiyalSymbol';
import type { AdminCategory, AdminProduct } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface ProductsManagerProps {
  categories: AdminCategory[];
  products: AdminProduct[];
  onAddClick: () => void;
  onEditClick: (product: AdminProduct) => void;
  onToggleVisible: (product: AdminProduct, visible: boolean) => Promise<void>;
  onDelete: (product: AdminProduct) => Promise<void>;
  onBulkSetVisible: (
    products: AdminProduct[],
    visible: boolean
  ) => Promise<void>;
  onBulkDelete: (products: AdminProduct[]) => Promise<void>;
}

function formatSelectedCount(count: number): string {
  if (count === 1) return 'منتج واحد محدد';
  if (count === 2) return 'منتجان محددان';
  if (count >= 3 && count <= 10) return `${count} منتجات محددة`;
  return `${count} منتج محدد`;
}

export function ProductsManager({
  categories,
  products,
  onAddClick,
  onEditClick,
  onToggleVisible,
  onDelete,
  onBulkSetVisible,
  onBulkDelete,
}: ProductsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Multi-select state (supports selecting products across different categories)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkWorking, setBulkWorking] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  // Keep selectedIds clean if products are removed externally
  useEffect(() => {
    const existingIds = new Set(products.map((p) => p.id));
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      let changed = false;
      const next = new Set<string>();
      for (const id of prev) {
        if (existingIds.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [products]);

  const categoryNameMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }
      if (q && !item.name.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [products, searchQuery, selectedCategory]);

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedIds.has(p.id)),
    [products, selectedIds]
  );

  const allDisplayedSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.has(p.id));

  const toggleSelectOne = (productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const toggleSelectAllDisplayed = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allDisplayedSelected) {
        for (const p of filteredProducts) {
          next.delete(p.id);
        }
      } else {
        for (const p of filteredProducts) {
          next.add(p.id);
        }
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleToggle = async (product: AdminProduct) => {
    setPendingToggleId(product.id);
    try {
      await onToggleVisible(product, !product.visible);
    } finally {
      setPendingToggleId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkVisibility = async (visible: boolean) => {
    if (selectedProducts.length === 0 || bulkWorking) return;
    setBulkWorking(true);
    try {
      await onBulkSetVisible(selectedProducts, visible);
      clearSelection();
    } finally {
      setBulkWorking(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedProducts.length === 0 || bulkWorking) return;
    setBulkWorking(true);
    try {
      await onBulkDelete(selectedProducts);
      setBulkDeleteConfirmOpen(false);
      clearSelection();
    } finally {
      setBulkWorking(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header & Add Button */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="hidden lg:block text-[22px] font-semibold text-[var(--text-primary)]">
            المنتجات
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)]">
            {filteredProducts.length} منتج
          </p>
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="pressable inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[14px] bg-[var(--accent)] px-4 text-[15px] font-medium text-[#FFFDF9] shadow-[var(--shadow-chip-active)]"
        >
          <Plus size={17} strokeWidth={2} aria-hidden="true" />
          <span>إضافة منتج</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <div className="relative sm:col-span-7">
          <Search
            size={17}
            strokeWidth={1.7}
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المنتج..."
            className="min-h-[44px] w-full rounded-[14px] bg-[var(--bg-surface)] pr-10 pl-3.5 text-[16px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-5">
          <select
            aria-label="تصفية حسب التصنيف"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="min-h-[44px] w-full rounded-[14px] bg-[var(--bg-surface)] px-3.5 text-[16px] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="all">جميع التصنيفات</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Select All Row (for mobile & quick access) */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between gap-2 px-1">
          <label className="inline-flex min-h-[36px] cursor-pointer items-center gap-2.5 text-[13.5px] font-medium text-[var(--text-secondary)] select-none">
            <input
              type="checkbox"
              checked={allDisplayedSelected}
              onChange={toggleSelectAllDisplayed}
              className="h-[18px] w-[18px] cursor-pointer rounded accent-[var(--accent)]"
            />
            <span>تحديد الكل ({filteredProducts.length})</span>
          </label>

          {selectedIds.size > 0 && (
            <span className="text-[12.5px] font-semibold text-[var(--accent)] tabular-nums">
              {formatSelectedCount(selectedIds.size)}
            </span>
          )}
        </div>
      )}

      {/* Bulk Actions Bar (Appears only when 1+ products are selected) */}
      {selectedIds.size > 0 && (
        <div
          role="region"
          aria-label="إجراءات جماعية للمنتجات المحددة"
          className="content-fade-in sticky top-[62px] lg:top-4 z-20 rounded-[18px] bg-[var(--bg-featured)] px-3.5 py-3 text-[#FDF9F3] shadow-[var(--shadow-featured)] border border-white/10"
        >
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13.5px] font-semibold text-[var(--accent-warm)] tabular-nums">
                {formatSelectedCount(selectedIds.size)}
              </span>

              <button
                type="button"
                disabled={bulkWorking}
                onClick={clearSelection}
                className="pressable inline-flex min-h-[34px] cursor-pointer items-center gap-1 rounded-full bg-white/10 px-2.5 text-[12px] font-medium text-[#E7D8C8] sm:hidden disabled:opacity-50"
              >
                <X size={13} strokeWidth={1.9} aria-hidden="true" />
                <span>إلغاء التحديد</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                disabled={bulkWorking}
                onClick={() => handleBulkVisibility(true)}
                className="pressable inline-flex min-h-[38px] flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-1.5 rounded-[11px] bg-white/12 px-3 text-[13px] font-medium text-[#FDF9F3] hover:bg-white/18 disabled:opacity-50"
              >
                <Eye size={14} strokeWidth={1.8} aria-hidden="true" />
                <span>إظهار</span>
              </button>

              <button
                type="button"
                disabled={bulkWorking}
                onClick={() => handleBulkVisibility(false)}
                className="pressable inline-flex min-h-[38px] flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-1.5 rounded-[11px] bg-white/12 px-3 text-[13px] font-medium text-[#FDF9F3] hover:bg-white/18 disabled:opacity-50"
              >
                <EyeOff size={14} strokeWidth={1.8} aria-hidden="true" />
                <span>إخفاء</span>
              </button>

              <button
                type="button"
                disabled={bulkWorking}
                onClick={() => setBulkDeleteConfirmOpen(true)}
                className="pressable inline-flex min-h-[38px] flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-1.5 rounded-[11px] bg-[#C94A4A]/25 px-3 text-[13px] font-medium text-[#FFD4D4] hover:bg-[#C94A4A]/35 disabled:opacity-50"
              >
                <Trash2 size={14} strokeWidth={1.8} aria-hidden="true" />
                <span>حذف</span>
              </button>

              <button
                type="button"
                disabled={bulkWorking}
                onClick={clearSelection}
                className="pressable hidden sm:inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-1 rounded-[11px] bg-white/8 px-3 text-[13px] font-medium text-[#D6C6B6] hover:bg-white/14 disabled:opacity-50"
              >
                <X size={14} strokeWidth={1.8} aria-hidden="true" />
                <span>إلغاء التحديد</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-[20px] bg-[var(--bg-surface)] px-5 py-12 text-center border border-[var(--border-subtle)]">
          <p className="text-[15px] font-medium text-[var(--text-primary)]">
            لا توجد منتجات مطابقة للبحث
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="space-y-2.5 md:hidden">
            {filteredProducts.map((product) => {
              const catName =
                categoryNameMap.get(product.categoryId) ?? 'بدون تصنيف';
              const isToggling = pendingToggleId === product.id;
              const isSelected = selectedIds.has(product.id);

              return (
                <article
                  key={product.id}
                  className={[
                    'rounded-[18px] bg-[var(--bg-surface)] p-3 border shadow-[var(--shadow-card)] transition-colors',
                    isSelected
                      ? 'border-[var(--accent)]/55 bg-[#FFFDF9] ring-1 ring-[var(--accent)]/20'
                      : 'border-[var(--border-subtle)]',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3">
                    <label
                      aria-label={`تحديد ${product.name}`}
                      className="flex h-10 w-8 shrink-0 cursor-pointer items-center justify-center"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(product.id)}
                        className="h-[18px] w-[18px] cursor-pointer rounded accent-[var(--accent)]"
                      />
                    </label>

                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[13px] bg-[var(--bg-subtle)]">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          width={64}
                          height={64}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15px] font-semibold text-[var(--text-primary)]">
                        {product.name}
                      </h3>
                      <p className="mt-0.5 truncate text-[12px] text-[var(--text-muted)]">
                        {catName}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-[15px] font-semibold tabular-nums text-[var(--text-primary)]">
                        <span>{product.price}</span>
                        <SaudiRiyalSymbol className="h-[13px] w-[13px] text-[var(--text-secondary)]" />
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-2.5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={product.visible}
                      disabled={isToggling}
                      onClick={() => handleToggle(product)}
                      className="inline-flex min-h-[36px] cursor-pointer items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)] disabled:opacity-50"
                    >
                      <span
                        className={[
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          product.visible
                            ? 'bg-[var(--accent)]'
                            : 'bg-[#2B1F19]/20',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-transform',
                            product.visible
                              ? '-translate-x-6'
                              : '-translate-x-1',
                          ].join(' ')}
                        />
                      </span>
                      <span>{product.visible ? 'ظاهر' : 'مخفي'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditClick(product)}
                        className="pressable inline-flex min-h-[38px] cursor-pointer items-center gap-1 rounded-[11px] bg-[var(--bg-canvas)] px-3 text-[13px] font-medium text-[var(--text-primary)] border border-[var(--border-subtle)]"
                      >
                        <Pencil size={14} strokeWidth={1.7} aria-hidden="true" />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(product)}
                        aria-label={`حذف ${product.name}`}
                        className="pressable flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[11px] bg-[#A63A3A]/[0.08] text-[#8E2A2A]"
                      >
                        <Trash2 size={15} strokeWidth={1.7} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-[20px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/70 text-[12.5px] font-medium text-[var(--text-muted)]">
                  <th className="w-12 py-3 pr-4 pl-2 text-center">
                    <input
                      type="checkbox"
                      aria-label="تحديد جميع المنتجات المعروضة"
                      checked={allDisplayedSelected}
                      onChange={toggleSelectAllDisplayed}
                      className="h-[17px] w-[17px] cursor-pointer rounded align-middle accent-[var(--accent)]"
                    />
                  </th>
                  <th className="py-3 px-3 font-medium">المنتج</th>
                  <th className="py-3 px-3 font-medium">التصنيف</th>
                  <th className="py-3 px-3 font-medium">السعر</th>
                  <th className="py-3 px-3 font-medium">الظهور</th>
                  <th className="py-3 pl-4 pr-3 text-left font-medium">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredProducts.map((product) => {
                  const catName =
                    categoryNameMap.get(product.categoryId) ?? 'بدون تصنيف';
                  const isToggling = pendingToggleId === product.id;
                  const isSelected = selectedIds.has(product.id);

                  return (
                    <tr
                      key={product.id}
                      className={[
                        'transition-colors',
                        isSelected
                          ? 'bg-[var(--accent-soft)]/55'
                          : 'hover:bg-[var(--bg-canvas)]/45',
                      ].join(' ')}
                    >
                      <td className="py-3 pr-4 pl-2 text-center">
                        <input
                          type="checkbox"
                          aria-label={`تحديد ${product.name}`}
                          checked={isSelected}
                          onChange={() => toggleSelectOne(product.id)}
                          className="h-[17px] w-[17px] cursor-pointer rounded align-middle accent-[var(--accent)]"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[11px] bg-[var(--bg-subtle)]">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                width={44}
                                height={44}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <span className="font-medium text-[14.5px] text-[var(--text-primary)]">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[13.5px] text-[var(--text-secondary)]">
                        {catName}
                      </td>
                      <td className="py-3 px-3 text-[14.5px] font-semibold tabular-nums text-[var(--text-primary)]">
                        <span className="inline-flex items-center gap-1">
                          <span>{product.price}</span>
                          <SaudiRiyalSymbol className="h-[13px] w-[13px] text-[var(--text-secondary)]" />
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={product.visible}
                          disabled={isToggling}
                          onClick={() => handleToggle(product)}
                          className="inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)] disabled:opacity-50"
                        >
                          <span
                            className={[
                              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                              product.visible
                                ? 'bg-[var(--accent)]'
                                : 'bg-[#2B1F19]/20',
                            ].join(' ')}
                          >
                            <span
                              className={[
                                'inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-transform',
                                product.visible
                                  ? '-translate-x-6'
                                  : '-translate-x-1',
                              ].join(' ')}
                            />
                          </span>
                          <span>{product.visible ? 'ظاهر' : 'مخفي'}</span>
                        </button>
                      </td>
                      <td className="py-3 pl-4 pr-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditClick(product)}
                            className="pressable inline-flex h-9 cursor-pointer items-center gap-1 rounded-[10px] bg-[var(--bg-canvas)] px-3 text-[13px] font-medium text-[var(--text-primary)] border border-[var(--border-subtle)]"
                          >
                            <Pencil size={14} strokeWidth={1.7} aria-hidden="true" />
                            <span>تعديل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            aria-label={`حذف ${product.name}`}
                            className="pressable flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] bg-[#A63A3A]/[0.08] text-[#8E2A2A]"
                          >
                            <Trash2 size={15} strokeWidth={1.7} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Single Product Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="تأكيد حذف المنتج"
        description={
          deleteTarget
            ? `هل أنت متأكد من حذف "${deleteTarget.name}" نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.`
            : ''
        }
        confirmLabel="حذف المنتج"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        title="تأكيد حذف المنتجات المحددة"
        description={`سيتم حذف ${selectedProducts.length} ${selectedProducts.length === 1 ? 'منتج' : selectedProducts.length === 2 ? 'منتجين' : selectedProducts.length <= 10 ? 'منتجات' : 'منتج'} نهائيًا من المنيو. هل أنت متأكد من المتابعة؟`}
        confirmLabel="تأكيد الحذف"
        destructive
        requireTypedText={
          selectedProducts.length > 5 ? 'تأكيد الحذف' : undefined
        }
        loading={bulkWorking}
        onConfirm={handleConfirmBulkDelete}
        onClose={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  );
}
