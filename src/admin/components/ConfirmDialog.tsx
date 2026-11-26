import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  hideConfirm?: boolean;
  requireTypedText?: string;
  loading?: boolean;
  onConfirm?: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  destructive = false,
  hideConfirm = false,
  requireTypedText,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [typedValue, setTypedValue] = useState('');

  useEffect(() => {
    if (open) {
      setTypedValue('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, loading, onClose]);

  if (!open) return null;

  const isConfirmBlocked =
    loading ||
    (Boolean(requireTypedText) && typedValue.trim() !== requireTypedText);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <button
        type="button"
        aria-label="إغلاق"
        disabled={loading}
        onClick={onClose}
        className="sheet-backdrop fixed inset-0 bg-[#2B1F19]/45 backdrop-blur-[2px]"
      />

      <div className="sheet-panel relative z-10 w-full max-w-[420px] rounded-t-[24px] sm:rounded-[24px] bg-[var(--bg-surface)] p-5 pb-safe sm:pb-5 shadow-2xl border-t sm:border border-[var(--border-subtle)]">
        <div className="flex items-start gap-3">
          <div
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              destructive
                ? 'bg-[#A63A3A]/10 text-[#8E2A2A]'
                : 'bg-[var(--accent-soft)] text-[var(--accent)]',
            ].join(' ')}
          >
            <AlertTriangle size={19} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3
              id="confirm-dialog-title"
              className="text-[16.5px] font-semibold text-[var(--text-primary)]"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
              {description}
            </p>
          </div>
        </div>

        {requireTypedText && !hideConfirm && (
          <div className="mt-4">
            <label
              htmlFor="confirm-typed-input"
              className="mb-1.5 block text-[13px] font-medium text-[var(--text-primary)]"
            >
              للمتابعة، اكتب{' '}
              <span className="font-semibold text-[#8E2A2A]">
                {requireTypedText}
              </span>{' '}
              في الحقل أدناه:
            </label>
            <input
              id="confirm-typed-input"
              type="text"
              autoComplete="off"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              disabled={loading}
              placeholder={requireTypedText}
              className="min-h-[44px] w-full rounded-[13px] bg-[var(--bg-canvas)] px-3.5 text-[16px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 border border-[var(--border-subtle)] focus:border-[#9E3232] focus:outline-none"
            />
          </div>
        )}

        <div className="mt-5 flex items-center gap-2.5">
          {!hideConfirm && onConfirm && (
            <button
              type="button"
              disabled={isConfirmBlocked}
              onClick={onConfirm}
              className={[
                'pressable flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[13px] px-4 text-[15px] font-medium text-[#FFFDF9] disabled:opacity-45 disabled:cursor-not-allowed',
                destructive ? 'bg-[#9E3232]' : 'bg-[var(--accent)]',
              ].join(' ')}
            >
              {loading ? 'جاري التنفيذ...' : confirmLabel}
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="pressable flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[13px] bg-[var(--bg-subtle)] px-4 text-[15px] font-medium text-[var(--text-primary)]"
          >
            {hideConfirm ? 'حسناً' : cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
