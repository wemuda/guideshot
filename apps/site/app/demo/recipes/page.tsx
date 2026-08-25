'use client';

import {
  BookOpen,
  FileText,
  FolderArchive,
  LogOut,
  Moon,
  Plus,
  Settings,
  Sun,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDemoPreferences } from '@/hooks/use-demo-preferences';
import {
  DEMO_SESSION_KEY,
  demoCopy,
  hasDemoSession,
  type DemoLocale,
} from '@/lib/demo';

const recipeRows = [
  ['Create a workspace', 'demo:admin', '6', 'ready'],
  ['Invite a teammate', 'demo:admin', '6', 'ready'],
  ['Update billing details', 'demo:owner', '4', 'draft'],
] as const;

const navigation = [
  [BookOpen, 'Overview'],
  [FileText, 'Recipes'],
  [FolderArchive, 'Collections'],
  [Settings, 'Settings'],
] as const;

export default function RecipesPage() {
  const router = useRouter();
  const { locale, ready, setLocale, setTheme, theme } = useDemoPreferences();
  const [authenticated, setAuthenticated] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const copy = demoCopy[locale];

  useEffect(() => {
    if (!hasDemoSession(localStorage)) {
      router.replace('/demo/sign-in');
      return;
    }

    queueMicrotask(() => setAuthenticated(true));
  }, [router]);

  function signOut() {
    localStorage.removeItem(DEMO_SESSION_KEY);
    router.replace('/demo/sign-in');
  }

  function createRecipe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDialogOpen(false);
  }

  if (!ready || !authenticated) {
    return (
      <main className="min-h-screen bg-background" aria-label="Loading demo" />
    );
  }

  return (
    <main
      className="min-h-screen bg-background text-foreground"
      data-guide-target="app.ready"
    >
      <span className="hidden" data-guide-target="app.loading">
        Loading
      </span>
      <div className="grid min-h-screen md:grid-cols-[210px_1fr]">
        <aside className="hidden border-r border-border bg-card/65 md:flex md:flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-border px-5">
            <span className="grid size-9 place-items-center rounded-xl bg-foreground text-sm font-black text-background">
              G
            </span>
            <div>
              <p className="text-sm font-bold tracking-[-0.03em]">
                GuideShot Studio
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                Pilot
              </p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-3" aria-label="Pilot navigation">
            {navigation.map(([Icon, label], index) => (
              <button
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  index === 1
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                data-guide-target={index === 1 ? 'nav.recipes' : undefined}
                key={label}
                type="button"
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>
          <div className="border-t border-border p-4 text-[11px] leading-5 text-muted-foreground">
            Deterministic local fixture
            <br />
            Schema version 1
          </div>
        </aside>

        <div className="min-w-0">
          <header
            className="flex h-20 items-center justify-between border-b border-border bg-card/65 px-4 sm:px-6 lg:px-8"
            data-guide-target="shell.header"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-lg bg-foreground text-xs font-black text-background md:hidden">
                G
              </span>
              <div>
                <p className="text-sm font-semibold">Docs workspace</p>
                <p className="text-xs text-muted-foreground">Capture fixture</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <label className="sr-only" htmlFor="demo-locale">
                Locale
              </label>
              <select
                className="h-9 rounded-full border border-border bg-background px-3 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary"
                id="demo-locale"
                onChange={(event) =>
                  setLocale(event.target.value as DemoLocale)
                }
                value={locale}
              >
                <option value="en">EN</option>
                <option value="da">DA</option>
                <option value="nb">NB</option>
              </select>
              <Button
                aria-label={`Use ${theme === 'light' ? 'dark' : 'light'} theme`}
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
              <div
                className="ml-1 hidden items-center gap-2 border-l border-border pl-3 sm:flex"
                data-guide-target="user.menu"
              >
                <Avatar>
                  <AvatarFallback>MC</AvatarFallback>
                </Avatar>
                <div className="hidden lg:block">
                  <p className="text-xs font-semibold">Mara Chen</p>
                  <p className="text-[10px] text-muted-foreground">
                    Administrator
                  </p>
                  <span
                    className="sr-only"
                    data-guide-target="privacy.user-email"
                  >
                    mara.chen@example.invalid
                  </span>
                </div>
                <Button
                  aria-label="Sign out"
                  onClick={signOut}
                  size="icon"
                  variant="ghost"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>
          </header>

          <section className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-10">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2 md:hidden">
                  <Badge variant="outline">GuideShot Studio</Badge>
                  <Badge variant="primary">Pilot</Badge>
                </div>
                <h1 className="text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                  {copy.recipes}
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                  {copy.recipesDescription}
                </p>
              </div>
              <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
                <DialogTrigger asChild>
                  <Button data-guide-target="recipes.create">
                    <Plus className="size-4" />
                    {copy.newRecipe}
                  </Button>
                </DialogTrigger>
                <DialogContent data-guide-target="recipe.form">
                  <DialogHeader>
                    <DialogTitle>{copy.createTitle}</DialogTitle>
                    <DialogDescription>
                      {copy.createDescription}
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-5" onSubmit={createRecipe}>
                    <div className="space-y-2">
                      <Label htmlFor="recipe-name">{copy.recipeName}</Label>
                      <Input
                        data-guide-target="recipe.name"
                        id="recipe-name"
                        placeholder="Invite a teammate"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipe-path">{copy.pagePath}</Label>
                      <Input
                        data-guide-target="recipe.path"
                        defaultValue="/settings/members"
                        id="recipe-path"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipe-scenario">
                        {copy.scenarioLabel}
                      </Label>
                      <select
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
                        data-guide-target="recipe.scenario"
                        defaultValue="demo:admin"
                        id="recipe-scenario"
                      >
                        <option value="demo:admin">Authenticated admin</option>
                        <option value="demo:owner">Authenticated owner</option>
                      </select>
                    </div>
                    <div
                      className="flex items-center justify-between rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm"
                      data-guide-target="recipe.matrix"
                    >
                      <span className="font-semibold">{copy.matrix}</span>
                      <span className="text-muted-foreground">
                        3 locales × 2 themes = 6 variants
                      </span>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          {copy.cancel}
                        </Button>
                      </DialogClose>
                      <Button data-guide-target="recipe.save" type="submit">
                        {copy.create}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div
              className="mt-9 overflow-hidden rounded-2xl border border-border bg-card"
              data-guide-target="recipes.table"
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/35 hover:bg-muted/35">
                    <TableHead>{copy.name}</TableHead>
                    <TableHead>{copy.scenario}</TableHead>
                    <TableHead className="text-center">
                      {copy.variants}
                    </TableHead>
                    <TableHead className="text-right">{copy.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipeRows.map(([name, scenario, variants, status]) => (
                    <TableRow key={name}>
                      <TableCell className="font-semibold">{name}</TableCell>
                      <TableCell>
                        <code className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                          {scenario}
                        </code>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {variants}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={status === 'ready' ? 'success' : 'outline'}
                        >
                          {status === 'ready' ? copy.ready : copy.draft}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Fixed fixture data · no network requests · no timestamps
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
