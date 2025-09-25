'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';

export default function SignupPage() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <SignupForm className="w-full max-w-sm" />
    </div>
  );
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isPending && session?.user) router.replace('/');
  }, [isPending, session, router]);

  if (isPending || session?.user) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData(form);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '');

      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
      });
      if (error) {
        setError(error.message || 'Sign up failed');
        return;
      }
      router.replace('/');
    } catch (_) {
      setError('Sign up failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={['flex flex-col gap-6', className].filter(Boolean).join(' ')}
      {...props}
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Sign up to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="flex flex-col gap-6">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => authClient.signIn.social({ provider: 'google' })}
              >
                Continue with Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">
                    or continue with email
                  </span>
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                />
              </div>
              {error ? (
                <p
                  role="alert"
                  aria-live="assertive"
                  className="text-sm text-red-500"
                >
                  {error}
                </p>
              ) : null}
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create account'}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  type="button"
                  onClick={() => router.push('/login')}
                >
                  Go to login
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <a href="/login" className="underline underline-offset-4">
                Log in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
