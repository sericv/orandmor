import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { fileToCompressedDataUri } from '../../utils/imageToDataUri';
import { useAnimatedOverlay } from '../hooks/useAnimatedOverlay';
import type { AdminCategory, CategoryFormValues } from '../types';

interface CategoryFormModalProps {
  open: boolean;
  category: AdminCategory | null;
  defaultSortOrder: number;
  saving: boolean;
  onSave: (values: CategoryFormValues) => Promise<void>;
  onClose: () => void;
}

function buildInitialValues(
  category: AdminCategory | null,
  defaultSortOrder: number
): CategoryFormValues {
  if (category) {
    return {
      name: category.name,
      description: category.description,
      image: category.image,
      sortOrder: category.sortOrder,
      visible: category.visible,
    };
  }
  return {
    name: '',
    description: '',
    image: '',
    sortOrder: defaultSortOrder,
    visible: true,
  };
}

export function CategoryFormModal({
  open,
  category,
  defaultSortOrder,
  saving,
  onSave,
  onClose,
}: CategoryFormModalProps) {
  const [values, setValues] = useState<CategoryFormValues>(() =>
    buildInitialValues(category, defaultSortOrder)
  );
  const [imageProcessing, setImageProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { rendered, closing } = useAnimatedOverlay(open);

  useEffect(() => {
    if (open) {
      setValues(buildInitialValues(category, defaultSortOrder));
      setError(null);
    }
  }, [open, category, defaultSortOrder]);

  useEffect(() => {
    if (!rendered) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [rendered, saving, onClose]);

  if (!rendered) return null;

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageProcessing(true);
    setError(null);
    try {
      const dataUri = await fileToCompressedDataUri(file, 500, 0.8);
      setValues((prev) => ({ ...prev, image: dataUri }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'تعذر معالجة الصورة المختارة.'
      );
    } finally {
      setImageProcessing(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError('يرجى إدخال اسم التصنيف.');
      return;
    }

    try {
      await onSave(values);
    } catch {
      setError('حدث خطأ أثناء حفظ التصنيف. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      <button
        type="button"
        aria-label="إغلاق"
        disabled={saving}
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
        className={[
          'fixed inset-0 bg-[#2B1F19]/45 backdrop-blur-[2px] touch-none overscroll-none',
          closing ? 'sheet-backdrop-exit' : 'sheet-backdrop',
        ].join(' ')}
      />

      <div
        className={[
          'relative z-10 flex max-h-[90dvh] w-full max-w-[460px] flex-col rounded-t-[26px] sm:rounded-[24px] bg-[var(--bg-surface)] shadow-2xl border-t sm:border border-[var(--border-subtle)] overscroll-contain',
          closing ? 'sheet-panel-exit' : 'sheet-panel',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
          <h2
            id="category-modal-title"
            className="text-[17px] font-semibold text-[var(--text-primary)]"
          >
            {category ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
          </h2>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="إغلاق"
            className="pressable flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)]"
          >
            <X size={17} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-4 pb-safe sm:pb-5"
        >
          {/* Optional Image */}
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-[var(--text-primary)]">
              صورة التصنيف (اختياري)
            </label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center">
                {values.image ? (
                  <img
                    src={values.image}
                    alt="صورة التصنيف"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImagePlus
                    size={20}
                    strokeWidth={1.5}
                    className="text-[var(--text-muted)]"
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="pressable inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-[12px] bg-[var(--bg-subtle)] px-3.5 text-[13.5px] font-medium text-[var(--text-primary)]">
                  <ImagePlus size={15} strokeWidth={1.75} aria-hidden="true" />
                  <span>
                    {imageProcessing
                      ? 'جاري المعالجة...'
                      : values.image
                        ? 'تغيير الصورة'
                        : 'اختيار صورة'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={saving || imageProcessing}
                    className="sr-only"
                  />
                </label>

                {values.image && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setValues((prev) => ({ ...prev, image: '' }))}
                    className="pressable inline-flex min-h-[40px] cursor-pointer items-center gap-1 rounded-[12px] bg-[#A63A3A]/[0.08] px-3 text-[13px] font-medium text-[#8E2A2A]"
                  >
                    <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
                    <span>إزالة</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="category-name"
              className="mb-1.5 block text-[13.5px] font-medium text-[var(--text-primary)]"
            >
              اسم التصنيف
            </label>
            <input
              id="category-name"
              type="text"
              required
              value={values.name}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="مثال: القهوة المختصة"
              className="min-h-[44px] w-full rounded-[13px] bg-[var(--bg-canvas)] px-3.5 text-[16px] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="category-sort"
                className="mb-1.5 block text-[13.5px] font-medium text-[var(--text-primary)]"
              >
                ترتيب الظهور
              </label>
              <input
                id="category-sort"
                type="number"
                inputMode="numeric"
                min="0"
                value={values.sortOrder}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    sortOrder: Number(e.target.value) || 0,
                  }))
                }
                className="min-h-[44px] w-full rounded-[13px] bg-[var(--bg-canvas)] px-3.5 text-[16px] tabular-nums text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <label className="flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2 rounded-[13px] bg-[var(--bg-canvas)] px-3.5 border border-[var(--border-subtle)]">
                <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
                  ظاهر بالمنيو
                </span>
                <input
                  type="checkbox"
                  checked={values.visible}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      visible: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[var(--accent)]"
                />
              </label>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-[12px] bg-[#A63A3A]/[0.08] px-3.5 py-2.5 text-[13px] font-medium text-[#8E2A2A]"
            >
              {error}
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="submit"
              disabled={saving || imageProcessing}
              className="pressable flex min-h-[46px] flex-1 cursor-pointer items-center justify-center rounded-[13px] bg-[var(--accent)] px-5 text-[16px] font-medium text-[#FFFDF9] shadow-[var(--shadow-chip-active)] disabled:opacity-60"
            >
              {saving
                ? 'جاري الحفظ...'
                : category
                  ? 'حفظ التعديلات'
                  : 'إضافة التصنيف'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="pressable flex min-h-[46px] cursor-pointer items-center justify-center rounded-[13px] bg-[var(--bg-subtle)] px-5 text-[15px] font-medium text-[var(--text-primary)]"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
