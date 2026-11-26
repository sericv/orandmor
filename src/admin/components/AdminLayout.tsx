import { useState, type ReactNode } from 'react';
import {
  BadgeDollarSign,
  BookOpenText,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  X,
  type LucideIcon,
} from 'lucide-react';
import { MENU_DEFAULTS } from '../../config/cafeConfig';
import { useAnimatedOverlay } from '../hooks/useAnimatedOverlay';
import type { AdminSection } from '../types';

interface AdminLayoutProps {
  cafeName: string;
  adminEmail: string;
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  onSignOut: () => void;
  children: ReactNode;
}

const NAV_ITEMS: {
  id: AdminSection;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}[] = [
  { id: 'overview', label: 'الرئيسية', shortLabel: 'الرئيسية', icon: LayoutDashboard },
  { id: 'products', label: 'المنتجات', shortLabel: 'المنتجات', icon: Package },
  { id: 'categories', label: 'التصنيفات', shortLabel: 'التصنيفات', icon: FolderKanban },
  { id: 'prices', label: 'تعديل الأسعار', shortLabel: 'الأسعار', icon: BadgeDollarSign },
  { id: 'guide', label: 'دليل الاستخدام', shortLabel: 'الدليل', icon: BookOpenText },
];

export function AdminLayout({
  cafeName,
  adminEmail,
  activeSection,
  onSelectSection,
  onSignOut,
  children,
}: AdminLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { rendered: drawerRendered, closing: drawerClosing } =
    useAnimatedOverlay(drawerOpen);

  const currentLabel =
    NAV_ITEMS.find((item) => item.id === activeSection)?.label ?? 'الرئيسية';

  const handleNavClick = (section: AdminSection) => {
    onSelectSection(section);
    setDrawerOpen(false);
  };

  const sidebarNav = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[var(--border-subtle)]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px]">
          <img
            src={`${import.meta.env.BASE_URL}images/or-and-mor-logo.jpg`}
            alt={cafeName}
            width={40}
            height={40}
            className="h-full w-full object-contain mix-blend-multiply"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15.5px] font-semibold text-[var(--text-primary)]">
            {cafeName}
          </p>
          <p className="text-[11.5px] text-[var(--text-muted)]">لوحة التحكم</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav aria-label="التنقل الإداري" className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeSection;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={[
                'pressable flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-[14px] px-3.5 text-[15px] font-medium',
                isActive
                  ? 'bg-[var(--accent)] text-[#FFFDF9] shadow-[var(--shadow-chip-active)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]/70 hover:text-[var(--text-primary)]',
              ].join(' ')}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="space-y-1.5 border-t border-[var(--border-subtle)] p-3">
        {adminEmail && (
          <p
            dir="ltr"
            className="truncate px-3 py-1 text-right text-[11.5px] text-[var(--text-muted)]"
          >
            {adminEmail}
          </p>
        )}

        <a
          href={import.meta.env.BASE_URL}
          className="pressable flex min-h-[42px] w-full items-center gap-3 rounded-[12px] px-3.5 text-[14px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]/70 hover:text-[var(--text-primary)]"
        >
          <ExternalLink size={16} strokeWidth={1.7} aria-hidden="true" />
          <span>عرض المنيو العام</span>
        </a>

        <button
          type="button"
          onClick={onSignOut}
          className="pressable flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-[12px] px-3.5 text-[14.5px] font-medium text-[#8E2A2A] hover:bg-[#A63A3A]/[0.08]"
        >
          <LogOut size={17} strokeWidth={1.7} aria-hidden="true" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] w-full max-w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] lg:flex">
      <div className="paper-grain" aria-hidden="true" />

      {/* Desktop Sidebar (RTL Right Side) */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:w-[252px] lg:shrink-0 lg:flex-col bg-[var(--bg-surface)] border-l border-[var(--border-subtle)]">
        {sidebarNav}
      </aside>

      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-30 pt-safe bg-[#F7F3ED]/95 backdrop-blur-xl border-b border-[var(--border-subtle)] lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="فتح القائمة"
              className="pressable flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
            >
              <Menu size={19} strokeWidth={1.75} aria-hidden="true" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-[16px] font-semibold leading-tight text-[var(--text-primary)]">
                {currentLabel}
              </h1>
              <p className="truncate text-[11px] text-[var(--text-muted)]">
                {cafeName || MENU_DEFAULTS.cafeName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            aria-label="تسجيل الخروج"
            className="pressable flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--bg-surface)] text-[#8E2A2A] border border-[var(--border-subtle)]"
          >
            <LogOut size={17} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {drawerRendered && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden overscroll-none"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة لوحة التحكم"
        >
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setDrawerOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
            className={[
              'fixed inset-0 bg-[#2B1F19]/40 backdrop-blur-[2px] touch-none overscroll-none',
              drawerClosing ? 'sheet-backdrop-exit' : 'sheet-backdrop',
            ].join(' ')}
          />
          <div
            className={[
              'relative z-10 flex h-full w-[272px] max-w-[82vw] flex-col bg-[var(--bg-surface)] shadow-2xl pt-safe pb-safe overscroll-contain',
              drawerClosing ? 'drawer-panel-exit' : 'drawer-panel',
            ].join(' ')}
          >
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="إغلاق"
              className="pressable absolute left-3 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)]"
            >
              <X size={17} strokeWidth={1.75} aria-hidden="true" />
            </button>
            {sidebarNav}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 px-4 pt-5 pb-24 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-[980px]">{children}</div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="التنقل السريع"
        className="fixed right-0 bottom-0 left-0 z-30 border-t border-[var(--border-subtle)] bg-[#FFFDF9]/95 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="mx-auto grid max-w-[480px] grid-cols-5 px-1.5 py-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeSection;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={[
                  'pressable flex min-h-[48px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[12px] text-[10.5px] font-medium',
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-muted)]',
                ].join(' ')}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.65}
                  aria-hidden="true"
                />
                <span className="truncate">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
