'use client';

import { useEffect } from 'react';
import { useConvexAuth } from 'convex/react';
import { usePathname, useRouter } from 'next/navigation';

const PUBLIC_PATHS = new Set([
  '/login',
  '/signup',
  '/doctor/signup',
  '/doctor/login',
]);

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const path = pathname || '';
    const isDoctorProtected =
      path.startsWith('/doctor') && !PUBLIC_PATHS.has(path);

    if (isAuthenticated) {
      // Redirect authenticated users away from generic auth pages
      if (path === '/login' || path === '/signup') {
        router.replace('/');
      }
      return;
    }

    // Unauthenticated: protect doctor routes specifically
    if (isDoctorProtected) {
      router.replace('/doctor/login');
      return;
    }

    // Fallback: keep existing protection for non-public pages
    if (!PUBLIC_PATHS.has(path)) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return <>{children}</>; // UI is already gated by redirects and expectAuth
}
