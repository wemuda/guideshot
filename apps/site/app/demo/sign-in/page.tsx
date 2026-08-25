'use client';

import {
  CheckCircle2,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { Brand } from '@/components/brand';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDemoPreferences } from '@/hooks/use-demo-preferences';
import { DEMO_EMAIL, DEMO_SESSION_KEY } from '@/lib/demo';

const promises = [
  [LockKeyhole, 'Deterministic state'],
  [ScanSearch, 'Stable DOM targets'],
  [ShieldCheck, 'No live customer data'],
] as const;

export default function DemoSignInPage() {
  const router = useRouter();
  const { ready } = useDemoPreferences();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (email.trim().toLowerCase() !== DEMO_EMAIL) {
      setError(`Use the deterministic account: ${DEMO_EMAIL}`);
      return;
    }

    localStorage.setItem(
      DEMO_SESSION_KEY,
      JSON.stringify({ version: 1, userId: 'demo-admin' }),
    );
    router.push('/demo/recipes');
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-background" aria-label="Loading demo" />
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <Button asChild size="sm" variant="ghost">
          <Link href="/">Exit pilot</Link>
        </Button>
      </header>
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl items-center gap-8 px-5 pb-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="order-2 lg:order-1">
          <Badge variant="primary">GuideShot Studio · Pilot fixture</Badge>
          <h1 className="mt-6 max-w-lg text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
            A real app state, made safe to reproduce.
          </h1>
          <p className="mt-5 max-w-md leading-7 text-muted-foreground">
            This small workspace proves that authentication and application
            state can stay in a typed adapter—never in the recipe.
          </p>
          <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {promises.map(([Icon, text]) => (
              <div
                className="flex items-center gap-3 text-sm font-medium"
                key={text}
              >
                <span className="grid size-9 place-items-center rounded-xl border border-border bg-card">
                  <Icon className="size-4 text-primary" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <Card
          className="order-1 mx-auto w-full max-w-md bg-card shadow-[0_30px_80px_-50px_rgba(16,20,31,0.55)] lg:order-2"
          data-guide-target="auth.card"
        >
          <CardHeader className="pb-3">
            <span className="mb-3 grid size-11 place-items-center rounded-xl bg-foreground text-background">
              <CheckCircle2 className="size-5" />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
              GuideShot Studio · Pilot fixture
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              Sign in to the demo workspace
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Use the deterministic account to explore a capture-ready
              authenticated state.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="demo-email">Work email</Label>
                <Input
                  aria-describedby={error ? 'demo-email-error' : undefined}
                  aria-invalid={Boolean(error)}
                  autoComplete="email"
                  data-guide-target="auth.email"
                  id="demo-email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                  placeholder={DEMO_EMAIL}
                  type="email"
                  value={email}
                />
                {error && (
                  <p
                    className="text-xs font-medium text-destructive"
                    data-guide-target="auth.error"
                    id="demo-email-error"
                  >
                    {error}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Button data-guide-target="auth.submit" size="lg" type="submit">
                  Continue
                </Button>
                <Button
                  data-guide-target="auth.demo-account"
                  onClick={() => {
                    setEmail(DEMO_EMAIL);
                    setError('');
                  }}
                  type="button"
                  variant="outline"
                >
                  Use demo account
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                No credentials leave this browser.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
