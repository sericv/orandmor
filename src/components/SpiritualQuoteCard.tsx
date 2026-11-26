export function SpiritualQuoteCard() {
  return (
    <aside aria-label="الصلاة على النبي" className="py-1">
      <div className="flex items-center justify-center gap-2 rounded-[13px] bg-[var(--bg-subtle)]/75 px-3 py-1.5 border border-[var(--border-subtle)]">
        <span
          aria-hidden="true"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--accent)] border border-[var(--border-subtle)]"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3L14.2 9.8L21 12L14.2 14.2L12 21L9.8 14.2L3 12L9.8 9.8L12 3Z" />
          </svg>
        </span>

        <p className="text-[13px] font-medium leading-snug text-[var(--text-primary)]">
          اللهم صلِّ وسلم على نبينا محمد ﷺ
        </p>
      </div>
    </aside>
  );
}
