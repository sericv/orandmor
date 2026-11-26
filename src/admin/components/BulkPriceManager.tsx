import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
} from 'lucide-react';
import { SaudiRiyalSymbol } from '../../components/SaudiRiyalSymbol';
import type {
  AdminProduct,
  BulkPriceExecutionResult,
  BulkPriceOperation,
  BulkPricePreviewItem,
} from '../types';

interface BulkPriceManagerProps {
  products: AdminProduct[];
  onApplyBulkPrices: (
    updates: { id: string; name: string; newPrice: number; cafeId: string }[]
  ) => Promise<BulkPriceExecutionResult>;
}

function formatPriceDisplay(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

export function BulkPriceManager({
  products,
  onApplyBulkPrices,
}: BulkPriceManagerProps) {
  const [operation, setOperation] = useState<BulkPriceOperation>('increase');
  const [amountInput, setAmountInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<BulkPriceExecutionResult | null>(null);

  const parsedAmount = useMemo(() => {
    const num = Number(amountInput);
    if (amountInput.trim() === '' || !Number.isFinite(num) || num <= 0) {
      return null;
    }
    return Math.round(num * 100) / 100;
  }, [amountInput]);

  const previewItems = useMemo<BulkPricePreviewItem[]>(() => {
    if (parsedAmount === null) return [];

    const delta = operation === 'increase' ? parsedAmount : -parsedAmount;

    return products
      .map((product) => {
        const oldPrice = Number(product.price);
        if (!Number.isFinite(oldPrice)) return null;
        const newPrice = Math.round((oldPrice + delta) * 100) / 100;
        return {
          id: product.id,
          name: product.name,
          oldPrice,
          newPrice,
          isInvalid: newPrice < 0,
        };
      })
      .filter((item): item is BulkPricePreviewItem => item !== null);
  }, [products, operation, parsedAmount]);

  const invalidItems = useMemo(
    () => previewItems.filter((item) => item.isInvalid),
    [previewItems]
  );

  const handleOperationChange = (nextOp: BulkPriceOperation) => {
    setOperation(nextOp);
    setShowPreview(false);
    setResult(null);
  };

  const handleAmountChange = (val: string) => {
    setAmountInput(val);
    setShowPreview(false);
    setResult(null);
  };

  const handleConfirmApply = async () => {
    if (
      applying ||
      parsedAmount === null ||
      previewItems.length === 0 ||
      invalidItems.length > 0
    ) {
      return;
    }

    setApplying(true);
    setResult(null);

    try {
      const productCafeMap = new Map(products.map((p) => [p.id, p.cafeId]));
      const payload = previewItems.map((item) => ({
        id: item.id,
        name: item.name,
        newPrice: item.newPrice,
        cafeId: productCafeMap.get(item.id) ?? '',
      }));

      const executionResult = await onApplyBulkPrices(payload);
      setResult(executionResult);

      if (executionResult.failedItems.length === 0) {
        setAmountInput('');
        setShowPreview(false);
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="hidden lg:block">
        <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">
          تعديل الأسعار
        </h1>
        <p className="mt-1 text-[13.5px] text-[var(--text-secondary)]">
          زيادة أو تخفيض أسعار جميع منتجات الكوفي بمبلغ ثابت بالريال السعودي.
        </p>
      </div>

      {/* Main Adjustment Card */}
      <section className="rounded-[22px] bg-[var(--bg-surface)] p-5 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
        <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
          تعديل أسعار المنتجات
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
          يُطبّق التعديل بمبلغ ثابت على جميع منتجات الكوفي الحالي فقط (
          <span className="tabular-nums font-medium">{products.length}</span>{' '}
          منتج) دون تعديل أي بيانات أخرى.
        </p>

        {/* Operation Selector */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={applying}
            onClick={() => handleOperationChange('increase')}
            className={[
              'pressable flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-[14px] px-3 text-[15px] font-medium border',
              operation === 'increase'
                ? 'bg-[var(--accent)] text-[#FFFDF9] border-transparent shadow-[var(--shadow-chip-active)]'
                : 'bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-subtle)]',
            ].join(' ')}
          >
            <Plus size={17} strokeWidth={2} aria-hidden="true" />
            <span>زيادة الأسعار</span>
          </button>

          <button
            type="button"
            disabled={applying}
            onClick={() => handleOperationChange('decrease')}
            className={[
              'pressable flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-[14px] px-3 text-[15px] font-medium border',
              operation === 'decrease'
                ? 'bg-[var(--accent)] text-[#FFFDF9] border-transparent shadow-[var(--shadow-chip-active)]'
                : 'bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-subtle)]',
            ].join(' ')}
          >
            <Minus size={17} strokeWidth={2} aria-hidden="true" />
            <span>تخفيض الأسعار</span>
          </button>
        </div>

        {/* Fixed SAR Amount Input */}
        <div className="mt-4">
          <label
            htmlFor="bulk-price-amount"
            className="mb-1.5 block text-[13.5px] font-medium text-[var(--text-primary)]"
          >
            مبلغ التعديل (ريال سعودي)
          </label>
          <div className="relative">
            <input
              id="bulk-price-amount"
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={amountInput}
              onChange={(e) => handleAmountChange(e.target.value)}
              disabled={applying}
              placeholder="مثال: 2"
              className="min-h-[46px] w-full rounded-[14px] bg-[var(--bg-canvas)] pr-4 pl-14 text-[16px] tabular-nums text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none"
            />
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex items-center text-[var(--text-muted)]">
              <SaudiRiyalSymbol className="h-[14px] w-[14px]" />
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={parsedAmount === null || products.length === 0 || applying}
          onClick={() => setShowPreview(true)}
          className="pressable mt-4 flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-[14px] bg-[var(--bg-featured)] px-5 text-[15.5px] font-medium text-[#FDF9F3] disabled:opacity-45 disabled:cursor-not-allowed"
        >
          معاينة الأسعار قبل التطبيق
        </button>
      </section>

      {/* Execution Result Feedback */}
      {result && (
        <section
          role="status"
          className={[
            'rounded-[18px] p-4 border',
            result.failedItems.length === 0
              ? 'bg-[#3F6A47]/[0.08] border-[#3F6A47]/20 text-[#2E5234]'
              : 'bg-[#A63A3A]/[0.08] border-[#A63A3A]/20 text-[#8E2A2A]',
          ].join(' ')}
        >
          {result.failedItems.length === 0 ? (
            <div className="flex items-start gap-2.5">
              <CheckCircle2
                size={19}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-[14.5px] font-semibold">
                  تم تحديث أسعار جميع المنتجات بنجاح
                </p>
                <p className="mt-0.5 text-[13px] opacity-90">
                  تم تعديل {result.succeededCount} منتج بنجاح.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  size={19}
                  strokeWidth={1.8}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-[14.5px] font-semibold">
                    فشل تحديث بعض المنتجات
                  </p>
                  <p className="mt-0.5 text-[13px]">
                    نجح تحديث {result.succeededCount} منتج، وفشل تحديث{' '}
                    {result.failedItems.length} منتج:
                  </p>
                </div>
              </div>
              <ul className="list-disc pr-6 text-[12.5px] space-y-1">
                {result.failedItems.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Preview Section Before Explicit Confirmation */}
      {showPreview && parsedAmount !== null && (
        <section className="rounded-[22px] bg-[var(--bg-surface)] p-5 border border-[var(--border-subtle)] shadow-[var(--shadow-card)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3.5">
            <div>
              <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                معاينة التعديل
              </h3>
              <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">
                {operation === 'increase' ? 'زيادة' : 'تخفيض'} بمقدار{' '}
                <strong className="inline-flex items-center gap-0.5 tabular-nums text-[var(--accent)]">
                  <span>
                    {operation === 'increase' ? '+' : '-'}
                    {formatPriceDisplay(parsedAmount)}
                  </span>
                  <SaudiRiyalSymbol className="h-[12.5px] w-[12.5px]" />
                </strong>{' '}
                على{' '}
                <strong className="tabular-nums">{previewItems.length}</strong>{' '}
                منتج
              </p>
            </div>
          </div>

          {/* Negative Price Protection Warning */}
          {invalidItems.length > 0 && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-[14px] bg-[#A63A3A]/[0.08] p-3.5 text-[13px] font-medium text-[#8E2A2A] border border-[#A63A3A]/20"
            >
              <AlertTriangle
                size={18}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div>
                لا يمكن تطبيق هذا التخفيض لأن {invalidItems.length} منتج سيصبح
                سعره أقل من الصفر. يرجى اختيار مبلغ تخفيض أقل.
              </div>
            </div>
          )}

          {/* Product-by-Product Old -> New Price List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-[var(--border-subtle)] rounded-[14px] bg-[var(--bg-canvas)]/70 px-3.5 border border-[var(--border-subtle)]">
            {previewItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-2.5 text-[13.5px]"
              >
                <span className="truncate font-medium text-[var(--text-primary)]">
                  {item.name}
                </span>

                <div className="flex shrink-0 items-center gap-2 tabular-nums">
                  <span className="text-[var(--text-muted)] line-through">
                    {formatPriceDisplay(item.oldPrice)}
                  </span>
                  <ArrowLeft
                    size={13}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className="text-[var(--text-muted)]"
                  />
                  <span
                    className={[
                      'inline-flex items-center gap-1 font-semibold',
                      item.isInvalid
                        ? 'text-[#8E2A2A]'
                        : 'text-[var(--accent)]',
                    ].join(' ')}
                  >
                    <span>{formatPriceDisplay(item.newPrice)}</span>
                    <SaudiRiyalSymbol className="h-[12.5px] w-[12.5px]" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Explicit Confirmation Button */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              disabled={applying || invalidItems.length > 0}
              onClick={handleConfirmApply}
              className="pressable flex min-h-[48px] flex-1 cursor-pointer items-center justify-center rounded-[14px] bg-[var(--accent)] px-5 text-[16px] font-medium text-[#FFFDF9] shadow-[var(--shadow-chip-active)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {applying ? 'جاري تحديث الأسعار...' : 'تأكيد تطبيق الأسعار'}
            </button>

            <button
              type="button"
              disabled={applying}
              onClick={() => setShowPreview(false)}
              className="pressable flex min-h-[48px] cursor-pointer items-center justify-center rounded-[14px] bg-[var(--bg-subtle)] px-4 text-[15px] font-medium text-[var(--text-primary)]"
            >
              إلغاء
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
