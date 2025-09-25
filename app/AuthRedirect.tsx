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
    if (!isAuthenticated) {
      if (!PUBLIC_PATHS.has(pathname || '')) {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return <>{children}</>; // UI is already gated by redirects and expectAuth
}
