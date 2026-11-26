import { StrictMode, Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const AdminApp = lazy(() => import('./admin/AdminApp'));

function isAdminPath(pathname: string): boolean {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const normalized =
    base && pathname.startsWith(base)
      ? pathname.slice(base.length) || '/'
      : pathname;
  return normalized === '/admin' || normalized.startsWith('/admin/');
}

function RootRouter() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (isAdminPath(pathname)) {
    return (
      <Suspense
        fallback={
          <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--bg-canvas)] text-[var(--text-secondary)]">
            <p className="text-[14.5px] font-medium">جاري تحميل لوحة التحكم...</p>
          </div>
        }
      >
        <AdminApp />
      </Suspense>
    );
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootRouter />
  </StrictMode>
);
