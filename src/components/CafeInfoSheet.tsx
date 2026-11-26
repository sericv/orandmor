import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Clock, ExternalLink, Phone, ShoppingBag, X } from 'lucide-react';
import {
  CAFE_CONTACT,
  CAFE_DELIVERY_APPS,
  CAFE_WORKING_HOURS,
  MENU_DEFAULTS,
} from '../config/cafeConfig';

interface CafeInfoSheetProps {
  open: boolean;
  cafeName: string;
  onClose: () => void;
}

const SHEET_EXIT_MS = 290;
const DISMISS_DISTANCE_PX = 84;
const DISMISS_VELOCITY_PX_MS = 0.35;

export function CafeInfoSheet({
  open,
  cafeName,
  onClose,
}: CafeInfoSheetProps) {
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (open) {
      setRendered(true);
      setClosing(false);
      setDragY(0);
      setIsDragging(false);
      return;
    }

    if (!rendered) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setRendered(false);
      setClosing(false);
      setDragY(0);
      return;
    }

    setIsDragging(false);
    setClosing(true);
    const timer = window.setTimeout(() => {
      setRendered(false);
      setClosing(false);
      setDragY(0);
    }, SHEET_EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [open, rendered]);

  useEffect(() => {
    if (!rendered) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Bulletproof iOS Safari + Android Chrome body scroll lock (preserves exact scrollY)
    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyLeft = body.style.left;
    const prevBodyRight = body.style.right;
    const prevBodyWidth = body.style.width;

    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      html.style.overflow = prevHtmlOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.left = prevBodyLeft;
      body.style.right = prevBodyRight;
      body.style.width = prevBodyWidth;
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, [rendered, onClose]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (closing || e.touches.length !== 1) return;
    const panel = panelRef.current;
    // Allow drag-to-dismiss only when scrolled to the top of the sheet
    if (panel && panel.scrollTop > 0) {
      touchStartYRef.current = null;
      return;
    }
    touchStartYRef.current = e.touches[0].clientY;
    touchStartTimeRef.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current === null || closing) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - touchStartYRef.current;

    if (delta > 0) {
      setIsDragging(true);
      setDragY(delta);
    } else if (isDragging) {
      setDragY(0);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartYRef.current === null) return;
    const elapsed = Math.max(1, Date.now() - touchStartTimeRef.current);
    const velocity = dragY / elapsed;

    touchStartYRef.current = null;

    if (dragY >= DISMISS_DISTANCE_PX || (dragY > 24 && velocity >= DISMISS_VELOCITY_PX_MS)) {
      onClose();
    } else {
      setIsDragging(false);
      setDragY(0);
    }
  };

  if (!rendered) return null;

  const panelStyle: CSSProperties = isDragging
    ? {
        transform: `translate3d(0, ${dragY}px, 0)`,
        transition: 'none',
      }
    : closing
      ? ({ '--sheet-drag-y': `${dragY}px` } as CSSProperties)
      : {};

  const backdropStyle: CSSProperties | undefined =
    isDragging && dragY > 0
      ? {
          opacity: Math.max(0.15, 1 - dragY / 320),
          transition: 'none',
        }
      : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 overscroll-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cafe-info-title"
    >
      {/* Backdrop — touch-none blocks drag/scroll chaining outside the sheet */}
      <button
        type="button"
        aria-label="إغلاق نافذة معلومات المقهى"
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
        style={backdropStyle}
        className={[
          'fixed inset-0 bg-[#2B1F19]/42 backdrop-blur-[2px] touch-none overscroll-none',
          closing ? 'sheet-backdrop-exit' : 'sheet-backdrop',
        ].join(' ')}
      />

      {/* Bottom Sheet Panel — scroll contained strictly inside the sheet */}
      <div
        ref={panelRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={panelStyle}
        className={[
          'relative z-10 max-h-[88dvh] w-full max-w-[460px] overflow-y-auto overscroll-contain touch-pan-y rounded-t-[26px] sm:rounded-[26px] bg-[var(--bg-surface)] px-5 pt-3 pb-safe sm:pb-5 shadow-2xl border-t sm:border border-[var(--border-subtle)]',
          closing
            ? 'sheet-panel-exit'
            : isDragging
              ? ''
              : 'sheet-panel transition-transform duration-[260ms] ease-in-out',
        ].join(' ')}
      >
        {/* Mobile Grab Handle */}
        <div
          aria-hidden="true"
          className="mx-auto mb-3.5 h-1 w-10 rounded-full bg-[#2B1F19]/15 sm:hidden"
        />

        {/* Sheet Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="cafe-info-title"
              className="text-[18px] font-semibold text-[var(--text-primary)]"
            >
              معلومات المقهى
            </h2>
            <p className="mt-0.5 text-[12.5px] text-[var(--text-muted)]">
              {cafeName || MENU_DEFAULTS.cafeName} ·{' '}
              <span className="font-latin">{MENU_DEFAULTS.subtitle}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="pressable flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)]"
          >
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {/* 1. Working Hours */}
          <section className="rounded-[18px] bg-[var(--bg-canvas)] p-3.5 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[var(--text-primary)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Clock size={15} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3>ساعات العمل</h3>
            </div>

            <div className="mt-3 space-y-2">
              {CAFE_WORKING_HOURS.map((schedule) => (
                <div
                  key={schedule.days}
                  className="flex items-center justify-between gap-2 text-[13px]"
                >
                  <span className="font-medium text-[var(--text-secondary)]">
                    {schedule.days}
                  </span>
                  <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                    {schedule.hours}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Delivery Apps */}
          <section className="rounded-[18px] bg-[var(--bg-canvas)] p-3.5 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[var(--text-primary)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <ShoppingBag size={15} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3>متوفرين على تطبيقات التوصيل</h3>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {CAFE_DELIVERY_APPS.map((app) => {
                const content = (
                  <>
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[11px] shadow-2xs">
                      <img
                        src={app.logo}
                        alt={app.nameAr}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-right">
                      <p className="truncate text-[13.5px] font-semibold text-[var(--text-primary)] leading-tight">
                        {app.nameAr}
                      </p>
                      <p className="font-latin truncate text-[11px] text-[var(--text-muted)] mt-0.5">
                        {app.nameEn}
                      </p>
                    </div>
                    {app.url && (
                      <ExternalLink
                        size={13}
                        strokeWidth={1.75}
                        aria-hidden="true"
                        className="shrink-0 text-[var(--text-muted)]"
                      />
                    )}
                  </>
                );

                if (app.url) {
                  return (
                    <a
                      key={app.id}
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pressable flex items-center gap-2.5 rounded-[14px] bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-2.5 rounded-[14px] bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Contact Us */}
          <section className="rounded-[18px] bg-[var(--bg-canvas)] p-3.5 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[var(--text-primary)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Phone size={15} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3>التواصل معنا</h3>
            </div>

            <p className="mt-2 text-[12.5px] text-[var(--text-secondary)]">
              {CAFE_CONTACT.purpose}
            </p>

            <a
              href={CAFE_CONTACT.telHref}
              className="pressable mt-2.5 flex min-h-[44px] w-full items-center justify-between gap-3 rounded-[14px] bg-[var(--bg-surface)] px-3.5 py-2 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]"
            >
              <span className="text-[13px] font-medium text-[var(--accent)]">
                اتصال مباشر
              </span>
              <span
                dir="ltr"
                className="text-[15.5px] font-semibold tabular-nums tracking-[0.03em] text-[var(--text-primary)]"
              >
                {CAFE_CONTACT.phone}
              </span>
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
