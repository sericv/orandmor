import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  CakeSlice,
  Coffee,
  Croissant,
  CupSoda,
  GlassWater,
  LayoutGrid,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryFilterId, MenuCategory } from '../types/menu';

interface CategoryBarProps {
  categories: MenuCategory[];
  activeCategory: CategoryFilterId;
  onSelectCategory: (id: CategoryFilterId) => void;
  loading?: boolean;
}

interface PillIndicator {
  left: number;
  width: number;
  ready: boolean;
}

function getCategoryIcon(name: string): LucideIcon {
  const normalized = name.trim().toLowerCase();

  if (
    normalized.includes('ساخن') ||
    normalized.includes('حار') ||
    normalized.includes('hot') ||
    normalized.includes('إسبريسو') ||
    normalized.includes('اسبريسو')
  ) {
    return Coffee;
  }

  if (
    normalized.includes('بارد') ||
    normalized.includes('آيس') ||
    normalized.includes('ايس') ||
    normalized.includes('مثلج') ||
    normalized.includes('cold') ||
    normalized.includes('iced')
  ) {
    return GlassWater;
  }

  if (
    normalized.includes('حلو') ||
    normalized.includes('حلى') ||
    normalized.includes('كيك') ||
    normalized.includes('dessert') ||
    normalized.includes('sweet')
  ) {
    return CakeSlice;
  }

  if (
    normalized.includes('مخبوز') ||
    normalized.includes('كرواسون') ||
    normalized.includes('معجنات') ||
    normalized.includes('bakery') ||
    normalized.includes('pastry')
  ) {
    return Croissant;
  }

  if (
    normalized.includes('فطور') ||
    normalized.includes('افطار') ||
    normalized.includes('إفطار') ||
    normalized.includes('ساندو') ||
    normalized.includes('breakfast')
  ) {
    return UtensilsCrossed;
  }

  if (
    normalized.includes('مشروب') ||
    normalized.includes('عصير') ||
    normalized.includes('موهيتو') ||
    normalized.includes('drink') ||
    normalized.includes('beverage')
  ) {
    return CupSoda;
  }

  if (normalized.includes('قهوة') || normalized.includes('coffee')) {
    return Coffee;
  }

  return Sparkles;
}

export const CategoryBar = memo(function CategoryBar({
  categories,
  activeCategory,
  onSelectCategory,
  loading = false,
}: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [indicator, setIndicator] = useState<PillIndicator>({
    left: 0,
    width: 0,
    ready: false,
  });

  // Measure active chip position inside the horizontal track for smooth sliding pill
  const updateIndicator = useCallback(() => {
    const activeEl = buttonRefs.current[activeCategory];
    if (!activeEl) return;

    setIndicator({
      left: activeEl.offsetLeft,
      width: activeEl.offsetWidth,
      ready: true,
    });
  }, [activeCategory]);

  useLayoutEffect(() => {
    if (loading) return;
    updateIndicator();
  }, [loading, categories, updateIndicator]);

  useEffect(() => {
    if (loading) return;
    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [loading, updateIndicator]);

  // Smoothly scroll ONLY horizontally inside the category rail when activeCategory changes
  useEffect(() => {
    if (loading) return;
    const container = scrollRef.current;
    const el = buttonRefs.current[activeCategory];
    if (!container || !el) return;

    const containerRect = container.getBoundingClientRect();
    const chipRect = el.getBoundingClientRect();
    const delta =
      chipRect.left +
      chipRect.width / 2 -
      (containerRect.left + containerRect.width / 2);

    if (Math.abs(delta) > 16) {
      container.scrollBy({
        left: delta,
        behavior: 'smooth',
      });
    }
  }, [activeCategory, loading]);

  return (
    <div
      style={{
        top: 'calc(56px + env(safe-area-inset-top, 0px))',
      }}
      className="sticky z-20 -mx-4 px-4 bg-[#F7F3ED]/95 backdrop-blur-xl border-b border-[var(--border-subtle)]"
    >
      {loading ? (
        <div aria-hidden="true" className="py-2">
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 py-0.5 no-scrollbar">
            {[82, 108, 114, 132, 112].map((width, index) => (
              <div
                key={index}
                style={{ width }}
                className="h-[42px] shrink-0 animate-pulse rounded-full bg-[var(--bg-subtle)]"
              />
            ))}
          </div>
        </div>
      ) : (
        <nav aria-label="تصنيفات القائمة" className="py-2">
          <div
            ref={scrollRef}
            role="tablist"
            aria-label="تصنيفات المنتجات"
            className="-mx-4 overflow-x-auto px-4 py-0.5 no-scrollbar"
          >
            <div
              ref={trackRef}
              className="relative inline-flex items-center gap-2"
            >
              {/* Smooth sliding active background pill */}
              {indicator.ready && (
                <div
                  aria-hidden="true"
                  className="category-active-pill pointer-events-none absolute top-0 bottom-0 left-0 rounded-full bg-[var(--accent)] shadow-[var(--shadow-chip-active)]"
                  style={{
                    width: `${indicator.width}px`,
                    transform: `translate3d(${indicator.left}px, 0, 0)`,
                  }}
                />
              )}

              {/* "All" chip */}
              <button
                ref={(node) => {
                  buttonRefs.current['all'] = node;
                }}
                type="button"
                role="tab"
                aria-selected={activeCategory === 'all'}
                onClick={() => onSelectCategory('all')}
                className={[
                  'pressable relative z-10 shrink-0 cursor-pointer whitespace-nowrap rounded-full min-h-[42px] px-4 text-[16px] font-medium leading-none flex items-center justify-center gap-1.5',
                  activeCategory === 'all'
                    ? indicator.ready
                      ? 'bg-transparent text-[#FFFDF9] border border-transparent'
                      : 'bg-[var(--accent)] text-[#FFFDF9] border border-transparent'
                    : 'chip-inactive bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
                ].join(' ')}
              >
                <LayoutGrid
                  size={16}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className="shrink-0 opacity-90"
                />
                <span>الكل</span>
              </button>

              {/* Firestore categories with vector icons */}
              {categories.map((category) => {
                const isActive = category.id === activeCategory;
                const Icon = getCategoryIcon(category.name);

                return (
                  <button
                    key={category.id}
                    ref={(node) => {
                      buttonRefs.current[category.id] = node;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onSelectCategory(category.id)}
                    className={[
                      'pressable relative z-10 shrink-0 cursor-pointer whitespace-nowrap rounded-full min-h-[42px] px-4 text-[16px] font-medium leading-none flex items-center justify-center gap-1.5',
                      isActive
                        ? indicator.ready
                          ? 'bg-transparent text-[#FFFDF9] border border-transparent'
                          : 'bg-[var(--accent)] text-[#FFFDF9] border border-transparent'
                        : 'chip-inactive bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
                    ].join(' ')}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.7}
                      aria-hidden="true"
                      className="shrink-0 opacity-90"
                    />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
});
