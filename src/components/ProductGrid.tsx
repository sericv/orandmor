import { memo } from 'react';
import { BookOpen, ChevronLeft, LayoutGrid, List } from 'lucide-react';
import type {
  CategoryFilterId,
  MenuCategory,
  MenuProduct,
  ProductViewMode,
} from '../types/menu';
import { ProductCard } from './ProductCard';

export interface CategorySectionGroup {
  category: MenuCategory;
  previewItems: MenuProduct[];
  totalCount: number;
}

interface ProductGridProps {
  isAllView: boolean;
  title: string;
  items: MenuProduct[];
  groupedSections: CategorySectionGroup[];
  categoryKey: CategoryFilterId;
  viewMode: ProductViewMode;
  onChangeViewMode: (mode: ProductViewMode) => void;
  onViewAllCategory: (categoryId: string) => void;
  onSelectProduct: (product: MenuProduct) => void;
  loading?: boolean;
}

function ViewModeToggle({
  viewMode,
  onChangeViewMode,
}: {
  viewMode: ProductViewMode;
  onChangeViewMode: (mode: ProductViewMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="طريقة عرض المنتجات"
      className="inline-flex shrink-0 items-center gap-0.5 rounded-[14px] bg-[var(--bg-subtle)]/85 p-1 border border-[var(--border-subtle)]"
    >
      <button
        type="button"
        aria-label="عرض شبكي"
        aria-pressed={viewMode === 'grid'}
        onClick={() => onChangeViewMode('grid')}
        className={[
          'pressable flex h-9 w-10 cursor-pointer items-center justify-center rounded-[10px] text-[16px]',
          viewMode === 'grid'
            ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-2xs ring-1 ring-[#2B1F19]/[0.05]'
            : 'text-[var(--text-muted)]',
        ].join(' ')}
      >
        <LayoutGrid size={17} strokeWidth={1.75} aria-hidden="true" />
      </button>

      <button
        type="button"
        aria-label="عرض قائمة"
        aria-pressed={viewMode === 'list'}
        onClick={() => onChangeViewMode('list')}
        className={[
          'pressable flex h-9 w-10 cursor-pointer items-center justify-center rounded-[10px] text-[16px]',
          viewMode === 'list'
            ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-2xs ring-1 ring-[#2B1F19]/[0.05]'
            : 'text-[var(--text-muted)]',
        ].join(' ')}
      >
        <List size={17} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}

export const ProductGrid = memo(function ProductGrid({
  isAllView,
  title,
  items,
  groupedSections,
  categoryKey,
  viewMode,
  onChangeViewMode,
  onViewAllCategory,
  onSelectProduct,
  loading = false,
}: ProductGridProps) {
  if (loading) {
    return (
      <section aria-label="جاري تحميل المنتجات" className="pt-3.5 pb-6">
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <div className="h-6 w-28 animate-pulse rounded-md bg-[var(--bg-subtle)]" />
          <div className="h-10 w-[86px] animate-pulse rounded-[14px] bg-[var(--bg-subtle)]" />
        </div>

        {viewMode === 'list' ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3.5 rounded-[18px] bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)]"
              >
                <div className="h-[88px] w-[88px] shrink-0 animate-pulse rounded-[13px] bg-[var(--bg-subtle)]" />
                <div className="flex-1 space-y-2.5 py-1">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--bg-subtle)]" />
                  <div className="h-3.5 w-1/4 animate-pulse rounded bg-[var(--bg-subtle)]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col rounded-[20px] bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)]"
              >
                <div className="aspect-square w-full animate-pulse rounded-[14px] bg-[var(--bg-subtle)]" />
                <div className="px-1 pt-3 pb-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--bg-subtle)]" />
                  <div className="h-3.5 w-1/3 animate-pulse rounded bg-[var(--bg-subtle)]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  const layoutClass =
    viewMode === 'list'
      ? 'flex flex-col gap-3'
      : 'grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5';

  // Multi-section Homepage View ("الكل"): Each visible category displays its first 5 products + "عرض الكل"
  if (isAllView) {
    return (
      <section aria-labelledby="products-section-heading" className="pt-3.5 pb-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            id="products-section-heading"
            className="truncate text-[18px] font-semibold leading-snug text-[var(--text-primary)]"
          >
            {title}
          </h2>

          <ViewModeToggle
            viewMode={viewMode}
            onChangeViewMode={onChangeViewMode}
          />
        </div>

        {groupedSections.length === 0 ? (
          <div className="rounded-[20px] bg-[var(--bg-surface)] px-5 py-10 text-center border border-[var(--border-subtle)]">
            <p className="text-[15px] font-medium text-[var(--text-primary)]">
              لا توجد منتجات متاحة حاليًا
            </p>
          </div>
        ) : (
          <div key="all-sections" role="tabpanel" className="content-fade-in space-y-7">
            {groupedSections.map((group, sectionIndex) => (
              <div key={group.category.id}>
                <div className="mb-3">
                  <h3 className="truncate text-[17px] font-semibold leading-snug text-[var(--text-primary)]">
                    {group.category.name}
                  </h3>
                </div>

                <div className={layoutClass}>
                  {group.previewItems.map((item, itemIndex) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      viewMode={viewMode}
                      priority={sectionIndex === 0 && itemIndex < 4}
                      onSelect={onSelectProduct}
                    />
                  ))}

                  {/* View Full Category Card — Calm Editorial Sand/Ivory Style */}
                  {viewMode === 'grid' ? (
                    <button
                      type="button"
                      onClick={() => onViewAllCategory(group.category.id)}
                      className="pressable relative flex h-full min-h-[210px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[20px] bg-[#F3ECE2] p-4 text-center border border-[#8B5A3C]/22"
                    >
                      {/* Whisper-subtle golden hairline corner ornament */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute top-3 flex items-center gap-1.5 text-[#B88B36]/55"
                      >
                        <span className="h-px w-5 bg-[#B88B36]/35" />
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 12 12"
                          fill="currentColor"
                        >
                          <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" />
                        </svg>
                        <span className="h-px w-5 bg-[#B88B36]/35" />
                      </span>

                      <div className="relative z-10 flex flex-col items-center gap-2.5 px-1 pt-2">
                        <span
                          aria-hidden="true"
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--accent)] border border-[#B88B36]/25"
                        >
                          <BookOpen size={19} strokeWidth={1.65} />
                        </span>

                        <span className="text-[14.5px] sm:text-[15px] font-semibold leading-[1.48] text-[var(--text-primary)]">
                          عرض قائمة {group.category.name} كاملة
                        </span>

                        <span
                          aria-hidden="true"
                          className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--accent)] border border-[#8B5A3C]/18"
                        >
                          <ChevronLeft size={15} strokeWidth={1.9} />
                        </span>
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onViewAllCategory(group.category.id)}
                      className="pressable flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-3 rounded-[18px] bg-[#F3ECE2] px-3.5 py-2.5 text-right border border-[#8B5A3C]/22"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--accent)] border border-[#B88B36]/25"
                        >
                          <BookOpen size={16} strokeWidth={1.65} />
                        </span>
                        <span className="truncate text-[14.5px] font-semibold text-[var(--text-primary)]">
                          عرض قائمة {group.category.name} كاملة
                        </span>
                      </div>

                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--accent)] border border-[#8B5A3C]/18"
                      >
                        <ChevronLeft size={15} strokeWidth={1.9} />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  // Single Category Full View
  return (
    <section aria-labelledby="products-section-heading" className="pt-3.5 pb-6">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h2
          id="products-section-heading"
          className="truncate text-[18px] font-semibold leading-snug text-[var(--text-primary)]"
        >
          {title}
        </h2>

        <ViewModeToggle
          viewMode={viewMode}
          onChangeViewMode={onChangeViewMode}
        />
      </div>

      {items.length === 0 ? (
        <div className="rounded-[20px] bg-[var(--bg-surface)] px-5 py-10 text-center border border-[var(--border-subtle)]">
          <p className="text-[15px] font-medium text-[var(--text-primary)]">
            لا توجد منتجات متاحة في هذا التصنيف حالياً
          </p>
          <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
            يمكنك استعراض باقي التصنيفات من الشريط بالأعلى.
          </p>
        </div>
      ) : (
        <div
          key={categoryKey}
          role="tabpanel"
          className={`content-fade-in ${layoutClass}`}
        >
          {items.map((item, index) => (
            <ProductCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              priority={index < 4}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      )}
    </section>
  );
});
