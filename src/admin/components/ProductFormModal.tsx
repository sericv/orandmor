import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { fileToCompressedDataUri } from '../../utils/imageToDataUri';
import { useAnimatedOverlay } from '../hooks/useAnimatedOverlay';
import type {
  AdminCategory,
  AdminProduct,
  ProductFormValues,
} from '../types';

interface ProductFormModalProps {
  open: boolean;
  product: AdminProduct | null;
  categories: AdminCategory[];
  saving: boolean;
  onSave: (values: ProductFormValues) => Promise<void>;
  onClose: () => void;
}

function buildInitialValues(
  product: AdminProduct | null,
  categories: AdminCategory[]
): ProductFormValues {
  if (product) {
    return {
      name: product.name,
      price: product.price,
      categoryId: product.categoryId || categories[0]?.id || '',
      image: product.image,
      description: product.description,
      calories: product.calories !== undefined ? String(product.calories) : '',
      isNew: product.isNew,
      isPopular: product.isPopular,
      mostPopular: product.mostPopular,
      visible: product.visible,
    };
  }
  return {
    name: '',
    price: '',
    categoryId: categories[0]?.id || '',
    image: '',
    description: '',
    calories: '',
    isNew: false,
    isPopular: false,
    mostPopular: false,
    visible: true,
  };
}

export function ProductFormModal({
  open,
  product,
  categories,
  saving,
  onSave,
  onClose,
}: ProductFormModalProps) {
  const [values, setValues] = useState<ProductFormValues>(() =>
    buildInitialValues(product, categories)
  );
  const [imageProcessing, setImageProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { rendered, closing } = useAnimatedOverlay(open);

  useEffect(() => {
    if (open) {
      setValues(buildInitialValues(product, categories));
      setError(null);
    }
  }, [open, product, categories]);

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
      const dataUri = await fileToCompressedDataUri(file);
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
      setError('يرجى إدخال اسم المنتج.');
      return;
    }

    const numericPrice = Number(values.price);
    if (values.price.trim() === '' || !Number.isFinite(numericPrice) || numericPrice < 0) {
      setError('يرجى إدخال سعر صحيح لا يقل عن الصفر.');
      return;
    }

    if (!values.categoryId) {
      setError('يرجى اختيار التصنيف.');
      return;
    }

    try {
      await onSave(values);
    } catch {
      setError('حدث خطأ أثناء حفظ المنتج. يرجى المحاولة مرة أخرى.');
    }
  };

  const toggleFlags: { key: 'visible' | 'isNew' | 'isPopular' | 'mostPopular'; label: string }[] = [
    { key: 'visible', label: 'ظاهر في المنيو' },
    { key: 'isNew', label: 'منتج جديد' },
    { key: 'isPopular', label: 'منتج شائع' },
    { key: 'mostPopular', label: 'الأكثر طلبًا' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
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
          'relative z-10 flex max-h-[92dvh] w-full max-w-[520px] flex-col rounded-t-[26px] sm:rounded-[24px] bg-[var(--bg-surface)] shadow-2xl border-t sm:border border-[var(--border-subtle)] overscroll-contain',
          closing ? 'sheet-panel-exit' : 'sheet-panel',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
          <h2
            id="product-modal-title"
            className="text-[17px] font-semibold text-[var(--text-primary)]"
          >
            {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
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

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-4 pb-safe sm:pb-5"
        >
          {/* Image Upload */}
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-[var(--text-primary)]">
              صورة المنتج
            </label>
            <div className="flex items-center gap-3.5">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[16px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center">
                {values.image ? (
                  <img
                    src={values.image}
                    alt="معاينة الصورة"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImagePlus
                    size={22}
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

          {/* Name */}
          <div>
            <label
              htmlFor="product-name"
              className="mb-1.5 block text-[13.5px] font-medium text-[var(--text-primary)]"
            >
              اسم المنتج
            </label>
            <input
              id="product-name"
              type="text"
              required
              value={values.name}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="مثال: آيس سبانش لاتيه"
              className="min-h-[44px] w-full rounded-[13px] bg-[var(--bg-canvas)] px-3.5 text-[16px] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="product-price"
                className="mb-1.5 block text-[13.5px] font-medium text-[var(--text-primary)]"
              >
                السعر (ريال سعودي)
              </label>
              <input
                id="product-price"
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                required
                value={values.price}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="0"
                className="min-h-[44px] w-full rounded-[13px] bg-[var(--bg-canvas)] px-3.5 text-[16px] tabular-nums text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="product-category"
                className="mb-1.5 block text-[13.5px] font-medium text-[var(--text-primary)]"
              >
                التصنيف
              </label>
              <select
                id="product-category"
                value={values.categoryId}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, categoryId: e.target.value }))
                }
                className="min-h-[44px] w-full rounded-[13px] bg-[var(--bg-canvas)] px-3 text-[16px] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="product-description"
              className="mb-1.5 block text-[13.5px] font-medium text-[var(--text-primary)]"
            >
              الوصف (اختياري)
            </label>
            <textarea
              id="product-description"
              rows={2}
              value={values.description}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="وصف مختصر للمنتج..."
              className="w-full rounded-[13px] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-[16px] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none resize-none"
            />
          </div>

          {/* Calories */}
          <div>
            <label
              htmlFor="product-calories"
              className="mb-1.5 block text-[13.5px] font-medium text-[var(--text-primary)]"
            >
              السعرات الحرارية (اختياري)
            </label>
            <input
              id="product-calories"
              type="number"
              inputMode="numeric"
              min="0"
              value={values.calories}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, calories: e.target.value }))
              }
              placeholder="مثال: 240"
              className="min-h-[44px] w-full rounded-[13px] bg-[var(--bg-canvas)] px-3.5 text-[16px] tabular-nums text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {/* Status & Flags */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {toggleFlags.map((flag) => {
              const checked = values[flag.key];
              return (
                <label
                  key={flag.key}
                  className={[
                    'flex min-h-[44px] cursor-pointer items-center justify-between gap-2 rounded-[13px] px-3 py-2 border transition-colors',
                    checked
                      ? 'bg-[var(--accent-soft)] border-[var(--accent)]/30'
                      : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)]',
                  ].join(' ')}
                >
                  <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
                    {flag.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [flag.key]: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                </label>
              );
            })}
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-[12px] bg-[#A63A3A]/[0.08] px-3.5 py-2.5 text-[13px] font-medium text-[#8E2A2A]"
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="submit"
              disabled={saving || imageProcessing}
              className="pressable flex min-h-[46px] flex-1 cursor-pointer items-center justify-center rounded-[13px] bg-[var(--accent)] px-5 text-[16px] font-medium text-[#FFFDF9] shadow-[var(--shadow-chip-active)] disabled:opacity-60"
            >
              {saving
                ? 'جاري الحفظ...'
                : product
                  ? 'حفظ التعديلات'
                  : 'إضافة المنتج'}
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
