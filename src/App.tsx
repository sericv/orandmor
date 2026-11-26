import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ACTIVE_CAFE_ID, MENU_DEFAULTS } from './config/cafeConfig';
import { fetchCafeMenu } from './services/menuService';
import type {
  CafeProfile,
  CategoryFilterId,
  MenuCategory,
  MenuProduct,
  ProductViewMode,
} from './types/menu';
import { Header } from './components/Header';
import { WelcomeSection } from './components/WelcomeSection';
import { SpiritualQuoteCard } from './components/SpiritualQuoteCard';
import { CategoryBar } from './components/CategoryBar';
import { FeaturedBanner } from './components/FeaturedBanner';
import {
  ProductGrid,
  type CategorySectionGroup,
} from './components/ProductGrid';
import { CafeInfoSheet } from './components/CafeInfoSheet';
import { ProductDetailsView } from './components/ProductDetailsView';

const VIEW_MODE_STORAGE_KEY = 'or-and-mor:menu-view-mode';
const HOME_SECTION_PREVIEW_LIMIT = 5;
const DETAILS_EXIT_MS = 200;

function getInitialViewMode(): ProductViewMode {
  try {
    const saved = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved === 'list' || saved === 'grid') {
      return saved;
    }
  } catch {
    // Ignore storage access errors in restricted environments
  }
  return 'grid';
}

function pickRandomProduct(
  pool: MenuProduct[],
  excludeId?: string | null
): MenuProduct | null {
  if (pool.length === 0) return null;

  const withImages = pool.filter((item) => Boolean(item.image));
  const candidates = withImages.length > 0 ? withImages : pool;

  const filteredCandidates =
    excludeId && candidates.length > 1
      ? candidates.filter((item) => item.id !== excludeId)
      : candidates;

  const randomIndex = Math.floor(Math.random() * filteredCandidates.length);
  return filteredCandidates[randomIndex] ?? null;
}

export default function App() {
  const [cafe, setCafe] = useState<CafeProfile | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryFilterId>('all');
  const [viewMode, setViewMode] = useState<ProductViewMode>(getInitialViewMode);
  const [featuredProduct, setFeaturedProduct] = useState<MenuProduct | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [isClosingDetails, setIsClosingDetails] = useState(false);

  const productsAnchorRef = useRef<HTMLDivElement | null>(null);
  const pushedProductHistoryRef = useRef(false);
  const savedScrollYRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const handleOpenInfo = useCallback(() => setInfoOpen(true), []);
  const handleCloseInfo = useCallback(() => setInfoOpen(false), []);

  const finishClosingDetails = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finalize = () => {
      setSelectedProductId(null);
      setIsClosingDetails(false);
      const restoreY = savedScrollYRef.current;
      savedScrollYRef.current = null;
      if (restoreY !== null) {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: restoreY, behavior: 'instant' });
        });
      }
    };

    if (prefersReducedMotion) {
      finalize();
      return;
    }

    setIsClosingDetails(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      finalize();
    }, DETAILS_EXIT_MS);
  }, []);

  const handleOpenProduct = useCallback((product: MenuProduct) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsClosingDetails(false);

    if (!pushedProductHistoryRef.current) {
      // First entry from the menu: snapshot exact scroll position & push ONE history entry
      savedScrollYRef.current = window.scrollY;
      window.history.pushState({ productId: product.id }, '');
      pushedProductHistoryRef.current = true;
    } else {
      // Navigating between suggested products: replace in-place so history never stacks
      window.history.replaceState({ productId: product.id }, '');
    }
    setSelectedProductId(product.id);
  }, []);

  const handleCloseProduct = useCallback(() => {
    if (isClosingDetails) return;
    if (pushedProductHistoryRef.current) {
      window.history.back();
    } else {
      finishClosingDetails();
    }
  }, [isClosingDetails, finishClosingDetails]);

  // Sync browser / phone Back button: a single Back always animates smoothly back to original menu state
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const nextId =
        event.state && typeof event.state.productId === 'string'
          ? event.state.productId
          : null;

      if (!nextId) {
        pushedProductHistoryRef.current = false;
        finishClosingDetails();
      } else {
        if (closeTimerRef.current !== null) {
          window.clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
        setIsClosingDetails(false);
        setSelectedProductId(nextId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [finishClosingDetails]);

  const handleChangeViewMode = useCallback((mode: ProductViewMode) => {
    setViewMode(mode);
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const handleSelectCategory = useCallback((nextId: CategoryFilterId) => {
    setActiveCategory(nextId);
  }, []);

  // When clicking "عرض الكل" from a section, switch to that category and gently bring
  // the top of the menu content into view if the user had scrolled far down.
  const handleViewAllCategory = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    const anchor = productsAnchorRef.current;
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      // Only adjust scroll if the user scrolled past the products start
      if (rect.top < 110) {
        const targetY = window.scrollY + rect.top - 116;
        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: 'smooth',
        });
      }
    }
  }, []);

  const loadMenu = useCallback((forceRefresh = false) => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCafeMenu(ACTIVE_CAFE_ID, { forceRefresh })
      .then((data) => {
        if (cancelled) return;
        setCafe(data.cafe);
        setCategories(data.categories);
        setProducts(data.products);
      })
      .catch(() => {
        if (cancelled) return;
        setError('تعذر تحميل القائمة حاليًا. يرجى المحاولة مرة أخرى.');
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return loadMenu(false);
  }, [loadMenu]);

  const cafeName = cafe?.name || MENU_DEFAULTS.cafeName;

  useEffect(() => {
    document.title = `${cafeName} | ${MENU_DEFAULTS.subtitle}`;
  }, [cafeName]);

  // Pre-group products by categoryId ONCE in memory for O(1) category switching
  const productsByCategory = useMemo(() => {
    const map = new Map<string, MenuProduct[]>();
    for (const product of products) {
      const key = product.categoryId;
      if (!key) continue;
      const list = map.get(key);
      if (list) {
        list.push(product);
      } else {
        map.set(key, [product]);
      }
    }
    return map;
  }, [products]);

  // Dynamic grouped sections for "الكل" homepage (ordered by sortOrder, hiding empty categories)
  const groupedSections = useMemo<CategorySectionGroup[]>(() => {
    const groups: CategorySectionGroup[] = [];
    for (const category of categories) {
      const categoryProducts = productsByCategory.get(category.id);
      if (!categoryProducts || categoryProducts.length === 0) continue;
      groups.push({
        category,
        previewItems: categoryProducts.slice(0, HOME_SECTION_PREVIEW_LIMIT),
        totalCount: categoryProducts.length,
      });
    }
    return groups;
  }, [categories, productsByCategory]);

  // Instant O(1) lookup for the active category's products
  const activeProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return products;
    }
    return productsByCategory.get(activeCategory) ?? [];
  }, [activeCategory, products, productsByCategory]);

  // Pick one random visible product from the active category (never changes on scroll/re-render)
  useEffect(() => {
    setFeaturedProduct((previous) =>
      pickRandomProduct(activeProducts, previous?.id)
    );
  }, [activeProducts]);

  const activeCategoryName = useMemo(() => {
    if (activeCategory === 'all') return undefined;
    return categories.find((cat) => cat.id === activeCategory)?.name;
  }, [categories, activeCategory]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return products.find((p) => p.id === selectedProductId) ?? null;
  }, [products, selectedProductId]);

  const isAllView = activeCategory === 'all';
  const sectionTitle = activeCategoryName ?? 'الأقسام';
  const isCafeInactive = !loading && !error && cafe !== null && !cafe.active;

  return (
    <div className="min-h-[100dvh] w-full max-w-full bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Subtle fixed paper grain overlay */}
      <div className="paper-grain" aria-hidden="true" />

      <Header cafeName={cafeName} onOpenInfo={handleOpenInfo} />

      <main className="mx-auto w-full max-w-[480px] md:max-w-[760px] px-4 pb-safe">
        <WelcomeSection />

        <SpiritualQuoteCard />

        {error ? (
          <section className="my-6 rounded-[20px] bg-[var(--bg-surface)] p-6 text-center border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
            <p className="text-[15px] font-medium text-[var(--text-primary)]">
              {error}
            </p>
            <button
              type="button"
              onClick={() => loadMenu(true)}
              className="pressable mt-4 inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] px-6 text-[16px] font-medium text-[#FFFDF9]"
            >
              إعادة المحاولة
            </button>
          </section>
        ) : isCafeInactive ? (
          <section className="my-6 rounded-[20px] bg-[var(--bg-surface)] p-6 text-center border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
            <p className="text-[16px] font-semibold text-[var(--text-primary)]">
              القائمة غير متاحة حاليًا
            </p>
            <p className="mt-1.5 text-[13.5px] text-[var(--text-secondary)]">
              نعتذر، يتم تحديث القائمة في الوقت الحالي.
            </p>
          </section>
        ) : (
          <>
            <CategoryBar
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              loading={loading}
            />

            <div ref={productsAnchorRef} />

            <FeaturedBanner
              item={featuredProduct}
              categoryLabel={activeCategoryName}
              onSelect={handleOpenProduct}
              loading={loading}
            />

            <ProductGrid
              isAllView={isAllView}
              title={sectionTitle}
              items={activeProducts}
              groupedSections={groupedSections}
              categoryKey={activeCategory}
              viewMode={viewMode}
              onChangeViewMode={handleChangeViewMode}
              onViewAllCategory={handleViewAllCategory}
              onSelectProduct={handleOpenProduct}
              loading={loading}
            />
          </>
        )}
      </main>

      <CafeInfoSheet
        open={infoOpen}
        cafeName={cafeName}
        onClose={handleCloseInfo}
      />

      {selectedProduct && (
        <ProductDetailsView
          product={selectedProduct}
          allProducts={products}
          categories={categories}
          isClosing={isClosingDetails}
          onBack={handleCloseProduct}
          onSelectProduct={handleOpenProduct}
        />
      )}
    </div>
  );
}
