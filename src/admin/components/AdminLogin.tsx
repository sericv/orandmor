import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { MENU_DEFAULTS } from '../../config/cafeConfig';
import {
  mapAuthErrorMessage,
  signInAdmin,
  type AdminUser,
} from '../../services/adminAuthService';

interface AdminLoginProps {
  onSuccess: (user: AdminUser) => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const user = await signInAdmin(email, password);
      onSuccess(user);
    } catch (err) {
      setError(mapAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[var(--bg-canvas)] px-4 py-8 pt-safe pb-safe flex flex-col items-center justify-center">
      <div className="paper-grain" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-[410px]">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[20px] bg-[var(--bg-surface)] p-2 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
            <img
              src={`${import.meta.env.BASE_URL}images/or-and-mor-logo.jpg`}
              alt={MENU_DEFAULTS.cafeName}
              width={64}
              height={64}
              className="h-full w-full object-contain mix-blend-multiply"
            />
          </div>

          <h1 className="mt-4 text-[22px] font-semibold text-[var(--text-primary)]">
            لوحة التحكم
          </h1>
          <p className="mt-1 text-[13.5px] text-[var(--text-secondary)]">
            {MENU_DEFAULTS.cafeName} ·{' '}
            <span className="font-latin">{MENU_DEFAULTS.subtitle}</span>
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-[24px] bg-[var(--bg-surface)] p-6 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1.5 block text-[13.5px] font-medium text-[var(--text-primary)]"
              >
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  strokeWidth={1.65}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  id="admin-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={submitting}
                  className="min-h-[46px] w-full rounded-[14px] bg-[var(--bg-canvas)] pr-10 pl-3.5 text-[16px] text-right text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/70 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-[13.5px] font-medium text-[var(--text-primary)]"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <Lock
                  size={17}
                  strokeWidth={1.65}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={submitting}
                  className="min-h-[46px] w-full rounded-[14px] bg-[var(--bg-canvas)] pr-10 pl-12 text-[16px] text-right text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/70 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
                  }
                  className="pressable absolute left-1 top-1/2 -translate-y-1/2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? (
                    <EyeOff size={17} strokeWidth={1.65} aria-hidden="true" />
                  ) : (
                    <Eye size={17} strokeWidth={1.65} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-[12px] bg-[#A63A3A]/[0.08] px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-[#8E2A2A] border border-[#A63A3A]/15"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="pressable mt-1 flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-[14px] bg-[var(--accent)] px-5 text-[16px] font-medium text-[#FFFDF9] shadow-[var(--shadow-chip-active)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>

        {/* Back to Menu link */}
        <div className="mt-5 text-center">
          <a
            href={import.meta.env.BASE_URL}
            className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowRight size={15} strokeWidth={1.7} aria-hidden="true" />
            <span>العودة إلى قائمة المنيو</span>
          </a>
        </div>
      </div>
    </div>
  );
}
