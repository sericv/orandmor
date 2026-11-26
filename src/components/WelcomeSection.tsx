import { MENU_DEFAULTS } from '../config/cafeConfig';

export function WelcomeSection() {
  return (
    <section
      aria-labelledby="welcome-heading"
      className="relative overflow-hidden pt-5 pb-3"
    >
      {/* Subtle decorative editorial coffee-ring watermark */}
      <svg
        aria-hidden="true"
        viewBox="0 0 140 140"
        fill="none"
        className="pointer-events-none absolute -left-6 top-2 h-28 w-28 text-[var(--accent)] opacity-[0.07]"
      >
        <circle
          cx="70"
          cy="70"
          r="56"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
        <circle cx="70" cy="70" r="38" stroke="currentColor" strokeWidth="1" />
        <path
          d="M70 46C61 57 61 69 70 74C79 79 79 89 70 96"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative">
        <h1
          id="welcome-heading"
          className="text-[24px] sm:text-[27px] font-semibold leading-[1.3] tracking-[-0.01em] text-[var(--text-primary)]"
        >
          {MENU_DEFAULTS.welcomeHeadline}
        </h1>

        <p className="mt-1.5 max-w-[36ch] text-[14px] leading-[1.6] text-[var(--text-secondary)]">
          {MENU_DEFAULTS.welcomeDescription}
        </p>
      </div>
    </section>
  );
}
