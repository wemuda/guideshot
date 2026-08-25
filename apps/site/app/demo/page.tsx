'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { hasDemoSession } from '@/lib/demo';

export default function DemoIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(
      hasDemoSession(localStorage) ? '/demo/recipes' : '/demo/sign-in',
    );
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">Opening GuideShot Studio…</p>
    </main>
  );
}
