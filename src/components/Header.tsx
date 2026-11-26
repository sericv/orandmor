import { memo } from 'react';
import { MENU_DEFAULTS } from '../config/cafeConfig';

interface HeaderProps {
  cafeName: string;
  onOpenInfo: () => void;
}

export const Header = memo(function Header({
  cafeName,
  onOpenInfo,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 pt-safe bg-[#F7F3ED]/95 backdrop-blur-xl border-b border-[var(--border-subtle)]">
      <div className="mx-auto flex h-14 max-w-[480px] md:max-w-[760px] items-center justify-between px-4">
        {/* Brand Identity (Logo + Name + Subtitle) */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px]">
            <img
              src={`${import.meta.env.BASE_URL}images/or-and-mor-logo.jpg`}
              alt={cafeName || MENU_DEFAULTS.cafeName}
              width={40}
              height={40}
              decoding="async"
              className="h-full w-full object-contain mix-blend-multiply"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="truncate text-[16px] font-semibold leading-tight text-[var(--text-primary)]">
              {cafeName || MENU_DEFAULTS.cafeName}
            </span>
            <span className="font-latin text-[11px] font-medium tracking-[0.04em] text-[var(--text-muted)] leading-tight mt-0.5">
              {MENU_DEFAULTS.subtitle}
            </span>
          </div>
        </div>

        {/* Minimal Info / Location Action */}
        <button
          type="button"
          onClick={onOpenInfo}
          aria-label="معلومات الكوفي وساعات العمل"
          className="pressable flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] text-[16px]"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 21s-6-5.2-6-10.5a6 6 0 1 1 12 0C18 15.8 12 21 12 21Z" />
            <circle cx="12" cy="10.5" r="2.2" />
          </svg>
        </button>
      </div>
    </header>
  );
});
