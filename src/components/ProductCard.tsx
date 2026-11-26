import { memo, useState } from 'react';
import { Flame } from 'lucide-react';
import type { MenuProduct, ProductViewMode } from '../types/menu';
import { SaudiRiyalSymbol } from './SaudiRiyalSymbol';

interface ProductCardProps {
  item: MenuProduct;
  viewMode: ProductViewMode;
  priority?: boolean;
  onSelect?: (item: MenuProduct) => void;
}

export const ProductCard = memo(function ProductCard({
  item,
  viewMode,
  priority = false,
  onSelect,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!onSelect) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(item);
    }
  };

  const badgeLabel =
    item.mostPopular || item.isPopular
      ? 'الأكثر طلبًا'
      : item.isNew
        ? 'جديد'
        : null;

  const hasValidImage = Boolean(item.image) && !imageError;

  const fallbackIcon = (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center text-[var(--text-muted)]/45"
    >
      <svg
        width={viewMode === 'list' ? '26' : '34'}
        height={viewMode === 'list' ? '26' : '34'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8Z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
      </svg>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <article
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onClick={onSelect ? () => onSelect(item) : undefined}
        onKeyDown={handleKeyDown}
        className={[
          'product-card flex items-center gap-3 rounded-[18px] bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]',
          onSelect ? 'pressable cursor-pointer' : '',
        ].join(' ')}
      >
        {/* Square Product Image on the Far Right (RTL Start) */}
        <div className="relative h-[76px] w-[76px] sm:h-[84px] sm:w-[84px] shrink-0 overflow-hidden rounded-[13px] bg-[var(--bg-subtle)]">
          {hasValidImage ? (
            <img
              src={item.image}
              alt={item.name}
              width={168}
              height={168}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => setImageError(true)}
              className="product-card-media h-full w-full object-cover"
            />
          ) : (
            fallbackIcon
          )}
        </div>

        {/* Name & Optional Description Next to Image (Right-Aligned) */}
        <div className="flex min-w-0 flex-1 flex-col justify-center text-right">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-[15px] font-medium leading-[1.35] text-[var(--text-primary)]">
              {item.name}
            </h3>

            {badgeLabel && (
              <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                {badgeLabel}
              </span>
            )}
          </div>

          {item.description && (
            <p className="mt-1 line-clamp-2 text-[12px] leading-[1.48] text-[var(--text-secondary)]">
              {item.description}
            </p>
          )}
        </div>

        {/* Prominent Price & Subtle Calories on the Far Left (RTL End) */}
        {(item.price || item.calories !== undefined) && (
          <div className="flex shrink-0 flex-col items-end justify-center pl-1.5">
            {item.price && (
              <div className="flex items-center gap-1 text-[var(--text-primary)]">
                <span className="text-[16.5px] font-bold tabular-nums leading-none">
                  {item.price}
                </span>
                <SaudiRiyalSymbol className="h-[14px] w-[14px] text-[var(--text-secondary)]" />
              </div>
            )}
            {item.calories !== undefined && (
              <div className="mt-1 flex items-center gap-0.5 text-[10.5px] font-medium tabular-nums text-[var(--text-muted)]">
                <Flame
                  size={10.5}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="text-[var(--accent)]/75"
                />
                <span>{item.calories} سعرة</span>
              </div>
            )}
          </div>
        )}
      </article>
    );
  }

  return (
    <article
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? () => onSelect(item) : undefined}
      onKeyDown={handleKeyDown}
      className={[
        'product-card flex h-full flex-col rounded-[20px] bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]',
        onSelect ? 'pressable cursor-pointer' : '',
      ].join(' ')}
    >
      {/* Prominent 1:1 Product Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[14px] bg-[var(--bg-subtle)]">
        {hasValidImage ? (
          <img
            src={item.image}
            alt={item.name}
            width={400}
            height={400}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setImageError(true)}
            className="product-card-media h-full w-full object-cover"
          />
        ) : (
          fallbackIcon
        )}

        {badgeLabel && (
          <span className="absolute top-2 right-2 rounded-full bg-[#FFFDF9]/92 px-2.5 py-0.5 text-[10.5px] font-medium text-[var(--text-primary)] shadow-2xs ring-1 ring-[#2B1F19]/[0.06]">
            {badgeLabel}
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col px-1 pt-2.5 pb-0.5">
        <h3 className="text-[14.5px] sm:text-[15px] font-semibold leading-[1.35] text-[var(--text-primary)]">
          {item.name}
        </h3>

        {item.description && (
          <p className="mt-1 line-clamp-2 text-[12px] leading-[1.48] text-[var(--text-secondary)]">
            {item.description}
          </p>
        )}

        {/* Price (Right) & Subtle Calories (Left) Row */}
        {(item.price || item.calories !== undefined) && (
          <div className="mt-auto flex items-center justify-between gap-1.5 pt-2.5">
            {item.price ? (
              <div className="flex items-center gap-1 text-[var(--text-primary)]">
                <span className="text-[16px] font-semibold tabular-nums leading-none">
                  {item.price}
                </span>
                <SaudiRiyalSymbol className="h-[14px] w-[14px] text-[var(--text-secondary)]" />
              </div>
            ) : (
              <span />
            )}
            {item.calories !== undefined && (
              <div className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium tabular-nums text-[var(--text-muted)]">
                <Flame
                  size={11}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="text-[var(--accent)]/75"
                />
                <span>{item.calories} سعرة</span>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
});
