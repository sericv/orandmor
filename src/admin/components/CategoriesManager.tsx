import { useMemo, useState } from 'react';
import { FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
import type { AdminCategory, AdminProduct } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface CategoriesManagerProps {
  categories: AdminCategory[];
  products: AdminProduct[];
  onAddClick: () => void;
  onEditClick: (category: AdminCategory) => void;
  onToggleVisible: (category: AdminCategory, visible: boolean) => Promise<void>;
  onDelete: (category: AdminCategory) => Promise<void>;
}

export function CategoriesManager({
  categories,
  products,
  onAddClick,
  onEditClick,
  onToggleVisible,
  onDelete,
}: CategoriesManagerProps) {
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const productCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products) {
      map.set(product.categoryId, (map.get(product.categoryId) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const handleToggle = async (category: AdminCategory) => {
    setPendingToggleId(category.id);
    try {
      await onToggleVisible(category, !category.visible);
    } finally {
      setPendingToggleId(null);
    }
  };

  const targetLinkedCount = deleteTarget
    ? (productCounts.get(deleteTarget.id) ?? 0)
    : 0;

  const handleConfirmDelete = async () => {
    if (!deleteTarget || targetLinkedCount > 0) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="hidden lg:block text-[22px] font-semibold text-[var(--text-primary)]">
            التصنيفات
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)]">
            {categories.length} تصنيفات مرتبة حسب ترتيب الظهور
          </p>
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="pressable inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[14px] bg-[var(--accent)] px-4 text-[15px] font-medium text-[#FFFDF9] shadow-[var(--shadow-chip-active)]"
        >
          <Plus size={17} strokeWidth={2} aria-hidden="true" />
          <span>إضافة تصنيف</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-[20px] bg-[var(--bg-surface)] px-5 py-12 text-center border border-[var(--border-subtle)]">
          <p className="text-[15px] font-medium text-[var(--text-primary)]">
            لا توجد تصنيفات بعد
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((category) => {
            const count = productCounts.get(category.id) ?? 0;
            const isToggling = pendingToggleId === category.id;

            return (
              <article
                key={category.id}
                className="rounded-[20px] bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[var(--bg-subtle)] text-[var(--accent)]">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        width={56}
                        height={56}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FolderKanban size={22} strokeWidth={1.65} aria-hidden="true" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15.5px] font-semibold text-[var(--text-primary)]">
                      {category.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-muted)]">
                      <span className="tabular-nums">{count} منتج</span>
                      <span>·</span>
                      <span className="tabular-nums">
                        الترتيب: {category.sortOrder}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={category.visible}
                    disabled={isToggling}
                    onClick={() => handleToggle(category)}
                    className="inline-flex min-h-[36px] cursor-pointer items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)] disabled:opacity-50"
                  >
                    <span
                      className={[
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        category.visible
                          ? 'bg-[var(--accent)]'
                          : 'bg-[#2B1F19]/20',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-transform',
                          category.visible
                            ? '-translate-x-6'
                            : '-translate-x-1',
                        ].join(' ')}
                      />
                    </span>
                    <span>{category.visible ? 'ظاهر' : 'مخفي'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEditClick(category)}
                      className="pressable inline-flex min-h-[38px] cursor-pointer items-center gap-1 rounded-[11px] bg-[var(--bg-canvas)] px-3 text-[13px] font-medium text-[var(--text-primary)] border border-[var(--border-subtle)]"
                    >
                      <Pencil size={14} strokeWidth={1.7} aria-hidden="true" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(category)}
                      aria-label={`حذف ${category.name}`}
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
      )}

      {/* Delete Confirmation or Linked-Products Protection Warning */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={
          targetLinkedCount > 0
            ? 'لا يمكن حذف هذا التصنيف حاليًا'
            : 'تأكيد حذف التصنيف'
        }
        description={
          deleteTarget
            ? targetLinkedCount > 0
              ? `يحتوي تصنيف "${deleteTarget.name}" على ${targetLinkedCount} منتج مرتبط به. يرجى نقل هذه المنتجات إلى تصنيف آخر أو حذفها أولًا قبل حذف التصنيف.`
              : `هل أنت متأكد من حذف تصنيف "${deleteTarget.name}" نهائيًا؟`
            : ''
        }
        confirmLabel="حذف التصنيف"
        destructive
        hideConfirm={targetLinkedCount > 0}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
