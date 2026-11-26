import { memo } from 'react';
import type { MenuProduct } from '../types/menu';
import { SaudiRiyalSymbol } from './SaudiRiyalSymbol';

interface FeaturedBannerProps {
  item: MenuProduct | null;
  categoryLabel?: string;
  onSelect?: (product: MenuProduct) => void;
  loading?: boolean;
}

export const FeaturedBanner = memo(function FeaturedBanner({
  item,
  categoryLabel,
  onSelect,
  loading = false,
}: FeaturedBannerProps) {
  if (loading) {
    return (
      <section aria-hidden="true" className="py-2.5">
        <div className="rounded-[24px] bg-[#2B1F19]/[0.045] p-1.5 ring-1 ring-[#2B1F19]/[0.06]">
          <div className="flex h-[136px] animate-pulse items-center justify-between gap-3.5 rounded-[18px] bg-[var(--bg-subtle)] p-4">
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="h-4 w-20 rounded-full bg-[#2B1F19]/10" />
              <div className="h-5 w-40 rounded-md bg-[#2B1F19]/10" />
              <div className="h-4 w-28 rounded-md bg-[#2B1F19]/8" />
            </div>
            <div className="h-[104px] w-[104px] shrink-0 rounded-[14px] bg-[#2B1F19]/10" />
          </div>
        </div>
      </section>
    );
  }

  if (!item) return null;

  const badgeText = categoryLabel ? `قد يعجبك · ${categoryLabel}` : 'اختيار اليوم';

  return (
    <section aria-label="منتج مقترح" className="py-2.5">
      {/* Subtle Double-Bezel Editorial Frame */}
      <div className="rounded-[24px] bg-[#2B1F19]/[0.045] p-1.5 ring-1 ring-[#2B1F19]/[0.06]">
        <article
          role={onSelect ? 'button' : undefined}
          tabIndex={onSelect ? 0 : undefined}
          onClick={onSelect ? () => onSelect(item) : undefined}
          onKeyDown={
            onSelect
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(item);
                  }
                }
              : undefined
          }
          className={[
            'relative overflow-hidden rounded-[18px] bg-[var(--bg-featured)] p-3.5 sm:p-4 shadow-[var(--shadow-featured)]',
            onSelect ? 'pressable cursor-pointer' : '',
          ].join(' ')}
        >
          {/* Very soft warm ambient glow in corner */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#C68B59]/15 blur-2xl"
          />

          <div
            key={item.id}
            className="content-fade-in relative flex items-center justify-between gap-3.5"
          >
            {/* Editorial Copy (Right side in RTL) */}
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <span className="inline-flex items-center rounded-full bg-white/[0.11] px-2.5 py-0.5 text-[11px] font-medium text-[var(--accent-warm)]">
                {badgeText}
              </span>

              <h2 className="mt-2 line-clamp-2 text-[17px] sm:text-[18px] font-semibold leading-snug text-[var(--text-on-dark)]">
                {item.name}
              </h2>

              {item.description && (
                <p className="mt-1 line-clamp-2 text-[12.5px] leading-[1.5] text-[var(--text-on-dark-muted)]">
                  {item.description}
                </p>
              )}

              {item.price && (
                <div className="mt-2.5 flex items-center gap-1 text-[var(--accent-warm)]">
                  <span className="text-[16px] font-semibold tabular-nums leading-none">
                    {item.price}
                  </span>
                  <SaudiRiyalSymbol className="h-[14px] w-[14px] opacity-90" />
                </div>
              )}
            </div>

            {/* Crisp Square Product Image (Left side in RTL) */}
            {item.image && (
              <div className="h-[104px] w-[104px] sm:h-[116px] sm:w-[116px] shrink-0 overflow-hidden rounded-[14px] bg-[var(--bg-featured-soft)] ring-1 ring-white/10">
                <img
                  src={item.image}
                  alt={item.name}
                  width={232}
                  height={232}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
});
