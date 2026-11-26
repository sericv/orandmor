import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import type { MenuCategory, MenuProduct } from '../types/menu';
import { SaudiRiyalSymbol } from './SaudiRiyalSymbol';
import { ProductCard } from './ProductCard';

interface ProductDetailsViewProps {
  product: MenuProduct;
  allProducts: MenuProduct[];
  categories: MenuCategory[];
  isClosing?: boolean;
  onBack: () => void;
  onSelectProduct: (product: MenuProduct) => void;
}

function shuffle<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickSuggestedProducts(
  current: MenuProduct,
  allProducts: MenuProduct[],
  count = 4
): MenuProduct[] {
  const candidates = allProducts.filter(
    (p) => p.id !== current.id && p.visible
  );
  if (candidates.length <= count) return shuffle(candidates);

  // Group candidates by category to prioritize variety across different categories
  const byCategory = new Map<string, MenuProduct[]>();
  for (const item of candidates) {
    const key = item.categoryId || '__other__';
    const list = byCategory.get(key);
    if (list) {
      list.push(item);
    } else {
      byCategory.set(key, [item]);
    }
  }

  const chosen: MenuProduct[] = [];
  const chosenIds = new Set<string>();

  // 1. Pick one random item from each OTHER category first
  const otherCategoryKeys = shuffle(
    [...byCategory.keys()].filter((k) => k !== current.categoryId)
  );

  for (const key of otherCategoryKeys) {
    if (chosen.length >= count) break;
    const pool = byCategory.get(key);
    if (!pool || pool.length === 0) continue;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    chosen.push(pick);
    chosenIds.add(pick.id);
  }

  // 2. Fill any remaining slots randomly from unselected candidates
  if (chosen.length < count) {
    const remaining = shuffle(candidates.filter((p) => !chosenIds.has(p.id)));
    for (const item of remaining) {
      if (chosen.length >= count) break;
      chosen.push(item);
      chosenIds.add(item.id);
    }
  }

  return chosen;
}

export function ProductDetailsView({
  product,
  allProducts,
  categories,
  isClosing = false,
  onBack,
  onSelectProduct,
}: ProductDetailsViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [imageError, setImageError] = useState(false);

  // Reset image error & scroll details view to top whenever product changes
  useEffect(() => {
    setImageError(false);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [product.id]);

  // Lock background page scroll so homepage stays at its exact scrollY
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBack]);

  const categoryName = useMemo(
    () => categories.find((c) => c.id === product.categoryId)?.name,
    [categories, product.categoryId]
  );

  const suggestedProducts = useMemo(
    () => pickSuggestedProducts(product, allProducts, 4),
    [product, allProducts]
  );

  const badgeLabel =
    product.mostPopular || product.isPopular
      ? 'الأكثر طلبًا'
      : product.isNew
        ? 'جديد'
        : null;

  const hasValidImage = Boolean(product.image) && !imageError;

  return (
    <div
      ref={scrollContainerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      className={[
        'fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-[var(--bg-canvas)] text-[var(--text-primary)]',
        isClosing ? 'details-overlay-exit' : 'details-overlay-enter',
      ].join(' ')}
    >
      <div className="mx-auto min-h-[100dvh] w-full max-w-[520px] md:max-w-[700px] pb-safe sm:px-4 sm:pt-5">
        {/* Top Hero Image Container */}
        <div className="relative aspect-[4/3.6] sm:aspect-[16/10] w-full overflow-hidden rounded-b-[28px] sm:rounded-[26px] bg-[var(--bg-subtle)] shadow-[var(--shadow-card)]">
          {hasValidImage ? (
            <img
              key={product.id}
              src={product.image}
              alt={product.name}
              decoding="async"
              onError={() => setImageError(true)}
              className="content-fade-in h-full w-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center text-[var(--text-muted)]/40"
            >
              <svg
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
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
          )}

          {/* Soft subtle top scrim for Back button readability */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#2B1F19]/25 to-transparent"
          />

          {/* Floating Back Button (RTL Top Right) */}
          <button
            type="button"
            onClick={onBack}
            aria-label="العودة إلى القائمة"
            style={{
              top: 'calc(14px + env(safe-area-inset-top, 0px))',
            }}
            className="pressable absolute right-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#FFFDF9]/92 text-[var(--text-primary)] shadow-md backdrop-blur-md ring-1 ring-[#2B1F19]/[0.08]"
          >
            <ArrowRight size={20} strokeWidth={1.85} aria-hidden="true" />
          </button>

          {/* Optional Badge (RTL Top Left) */}
          {badgeLabel && (
            <span
              style={{
                top: 'calc(20px + env(safe-area-inset-top, 0px))',
              }}
              className="absolute left-4 rounded-full bg-[#FFFDF9]/92 px-3 py-1 text-[12px] font-medium text-[var(--text-primary)] shadow-xs backdrop-blur-md ring-1 ring-[#2B1F19]/[0.06]"
            >
              {badgeLabel}
            </span>
          )}
        </div>

        {/* Product Information */}
        <div
          key={`details-${product.id}`}
          className="content-fade-in px-4 pt-5 sm:px-1"
        >
          <div className="flex flex-wrap items-center gap-2">
            {categoryName && (
              <span className="inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-[12px] font-medium text-[var(--text-secondary)]">
                {categoryName}
              </span>
            )}

            {product.calories !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-surface)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-muted)] border border-[var(--border-subtle)] tabular-nums">
                <Flame
                  size={13}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="text-[var(--accent)]"
                />
                <span>{product.calories} سعرة</span>
              </span>
            )}
          </div>

          <div className="mt-3 flex items-start justify-between gap-4">
            <h1
              id="product-detail-title"
              className="text-[22px] sm:text-[24px] font-semibold leading-[1.35] text-[var(--text-primary)]"
            >
              {product.name}
            </h1>

            {product.price && (
              <div className="flex shrink-0 items-center gap-1.5 rounded-[14px] bg-[var(--bg-surface)] px-3.5 py-2 text-[var(--accent)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
                <span className="text-[20px] font-bold tabular-nums leading-none">
                  {product.price}
                </span>
                <SaudiRiyalSymbol className="h-[16px] w-[16px]" />
              </div>
            )}
          </div>

          {product.description && (
            <p className="mt-3 text-[14.5px] leading-[1.75] text-[var(--text-secondary)]">
              {product.description}
            </p>
          )}

          {/* Suggested Products ("قد يعجبك أيضًا") */}
          {suggestedProducts.length > 0 && (
            <section
              aria-labelledby="suggested-products-heading"
              className="mt-7 border-t border-[var(--border-subtle)] pt-6 pb-4"
            >
              <h2
                id="suggested-products-heading"
                className="mb-3.5 text-[17px] font-semibold text-[var(--text-primary)]"
              >
                قد يعجبك أيضًا
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {suggestedProducts.map((suggested) => (
                  <ProductCard
                    key={suggested.id}
                    item={suggested}
                    viewMode="grid"
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
