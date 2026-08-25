'use client';

import {
  CheckCircle2,
  LockKeyhole,
  Moon,
  ScanSearch,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { Brand } from '@/components/brand';
import { DemoHelp } from '@/components/demo-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDemoPreferences } from '@/hooks/use-demo-preferences';
import {
  DEMO_EMAIL,
  DEMO_SESSION_KEY,
  demoCopy,
  type DemoLocale,
} from '@/lib/demo';

const promiseIcons = [LockKeyhole, ScanSearch, ShieldCheck] as const;

export default function DemoSignInPage() {
  const router = useRouter();
  const { locale, ready, setLocale, setTheme, theme } = useDemoPreferences();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const copy = demoCopy[locale];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (email.trim().toLowerCase() !== DEMO_EMAIL) {
      setError(`${copy.authInvalidEmail}: ${DEMO_EMAIL}`);
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
        <div className="flex items-center gap-1 sm:gap-2">
          <label className="sr-only" htmlFor="sign-in-locale">
            {copy.language}
          </label>
          <select
            className="h-9 rounded-full border border-border bg-background px-3 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary"
            id="sign-in-locale"
            onChange={(event) => setLocale(event.target.value as DemoLocale)}
            value={locale}
          >
            <option value="en">EN</option>
            <option value="da">DA</option>
            <option value="nb">NB</option>
          </select>
          <Button
            aria-label={
              theme === 'light' ? copy.useDarkTheme : copy.useLightTheme
            }
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            size="icon"
            variant="ghost"
          >
            {theme === 'light' ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )}
          </Button>
          <Button
            asChild
            className="hidden sm:inline-flex"
            size="sm"
            variant="ghost"
          >
            <Link href="/">{copy.exitPilot}</Link>
          </Button>
        </div>
      </header>
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl items-center gap-8 px-5 pb-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="order-2 lg:order-1">
          <Badge variant="primary">{copy.authBadge}</Badge>
          <h1 className="mt-6 max-w-lg text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
            {copy.authHeadline}
          </h1>
          <p className="mt-5 max-w-md leading-7 text-muted-foreground">
            {copy.authIntro}
          </p>
          <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {promiseIcons.map((Icon, index) => (
              <div
                className="flex items-center gap-3 text-sm font-medium"
                key={copy.authPromises[index]}
              >
                <span className="grid size-9 place-items-center rounded-xl border border-border bg-card">
                  <Icon className="size-4 text-primary" />
                </span>
                {copy.authPromises[index]}
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
              {copy.authBadge}
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              {copy.authSignInTitle}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {copy.authSignInDescription}
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="demo-email">{copy.authWorkEmail}</Label>
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
                  {copy.authContinue}
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
                  {copy.authUseDemoAccount}
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                {copy.authPrivacy}
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
      <DemoHelp locale={locale} theme={theme} />
    </main>
  );
}
