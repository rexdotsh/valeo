'use client';

import { useEffect, useState, type FormEvent } from 'react';
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
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function DoctorSignupPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const registerDoctor = useMutation(api.index.registerDoctor);

  const isDoctor = useQuery(api.index.isDoctor, {});
  useEffect(() => {
    if (!isPending && session?.user && isDoctor === true)
      router.replace('/doctor');
  }, [isPending, session, isDoctor, router]);

  if (isPending) return null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // TODO: MOVE TO A PROPER BACKEND API ROUTE
      // this hurts but it's a hackathon it's ok
      const REQUIRED_CODE = 'VALEODOC';
      if (authCode.trim() !== REQUIRED_CODE) {
        setError('Invalid authorization code');
        return;
      }
      if (!session?.user) {
        const { error } = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        if (error) {
          setError(error.message || 'Sign up failed');
          return;
        }
      }
      try {
        await registerDoctor({});
      } catch {}
      router.replace('/doctor');
    } catch (_) {
      setError('Sign up failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Doctor signup</CardTitle>
          <CardDescription>
            Create an account to access the portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                name="name"
                autoComplete="name"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                autoFocus
                autoComplete="email"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                autoComplete="new-password"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="code">Authorization code</Label>
              <Input
                id="code"
                type="text"
                required
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                name="code"
                placeholder="Enter provided code"
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
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? 'Creating…' : 'Create account'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full cursor-pointer"
                onClick={() => router.push('/doctor/login')}
              >
                Go to login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
