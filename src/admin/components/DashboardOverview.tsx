import {
  Eye,
  EyeOff,
  FolderKanban,
  Package,
  ArrowLeft,
} from 'lucide-react';
import { SaudiRiyalSymbol } from '../../components/SaudiRiyalSymbol';
import type { AdminCategory, AdminProduct, AdminSection } from '../types';

interface DashboardOverviewProps {
  categories: AdminCategory[];
  products: AdminProduct[];
  onNavigate: (section: AdminSection) => void;
  onEditProduct: (product: AdminProduct) => void;
}

export function DashboardOverview({
  categories,
  products,
  onNavigate,
  onEditProduct,
}: DashboardOverviewProps) {
  const visibleCount = products.filter((p) => p.visible).length;
  const hiddenCount = products.length - visibleCount;

  const categoryNameMap = new Map(categories.map((c) => [c.id, c.name]));

  const latestProducts = [...products]
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .slice(0, 6);

  const stats = [
    {
      label: 'إجمالي المنتجات',
      value: products.length,
      icon: Package,
      accent: 'text-[var(--accent)] bg-[var(--accent-soft)]',
    },
    {
      label: 'إجمالي التصنيفات',
      value: categories.length,
      icon: FolderKanban,
      accent: 'text-[#6B543E] bg-[#EFE9DF]',
    },
    {
      label: 'المنتجات الظاهرة',
      value: visibleCount,
      icon: Eye,
      accent: 'text-[#3F6A47] bg-[#3F6A47]/10',
    },
    {
      label: 'المنتجات المخفية',
      value: hiddenCount,
      icon: EyeOff,
      accent: 'text-[#8C6D4F] bg-[#8C6D4F]/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="hidden lg:block">
        <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">
          الرئيسية
        </h1>
        <p className="mt-1 text-[13.5px] text-[var(--text-secondary)]">
          نظرة سريعة على حالة القائمة والمنتجات.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-[20px] bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]"
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-[12px] ${stat.accent}`}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <p className="mt-3 text-[24px] font-semibold leading-none tabular-nums text-[var(--text-primary)]">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[12.5px] font-medium text-[var(--text-secondary)]">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Latest Added Products */}
      <section className="rounded-[22px] bg-[var(--bg-surface)] p-4 sm:p-5 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-[16.5px] font-semibold text-[var(--text-primary)]">
            آخر المنتجات المضافة
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="pressable inline-flex cursor-pointer items-center gap-1 rounded-full bg-[var(--bg-subtle)]/80 px-3 py-1.5 text-[12.5px] font-medium text-[var(--accent)]"
          >
            <span>كل المنتجات</span>
            <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        {latestProducts.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-[var(--text-muted)]">
            لا توجد منتجات مسجلة بعد.
          </p>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {latestProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-[var(--bg-subtle)]">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-semibold text-[var(--text-primary)]">
                      {product.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-[var(--text-muted)]">
                      <span className="truncate">
                        {categoryNameMap.get(product.categoryId) ?? 'بدون تصنيف'}
                      </span>
                      <span>·</span>
                      <span className="inline-flex shrink-0 items-center gap-0.5 tabular-nums font-medium text-[var(--text-secondary)]">
                        <span>{product.price}</span>
                        <SaudiRiyalSymbol className="h-[11.5px] w-[11.5px]" />
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={[
                      'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                      product.visible
                        ? 'bg-[#3F6A47]/10 text-[#3F6A47]'
                        : 'bg-[#2B1F19]/8 text-[var(--text-muted)]',
                    ].join(' ')}
                  >
                    {product.visible ? 'ظاهر' : 'مخفي'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditProduct(product)}
                    className="pressable cursor-pointer rounded-[10px] bg-[var(--bg-canvas)] px-2.5 py-1.5 text-[12.5px] font-medium text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  >
                    تعديل
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
