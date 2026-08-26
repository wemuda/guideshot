'use client';

import {
  ArrowUpRight01Icon,
  ChartLineData01Icon,
  CheckmarkCircle02Icon,
  CommandIcon,
  DashboardSquare01Icon,
  FilterHorizontalIcon,
  Menu01Icon,
  MoreHorizontalIcon,
  Notification02Icon,
  Package02Icon,
  Search01Icon,
  Settings01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { Badge } from '@guideshot/ui/components/badge';
import { Button } from '@guideshot/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@guideshot/ui/components/card';
import { Icon, type IconData } from '@guideshot/ui/components/icon';
import { Input } from '@guideshot/ui/components/input';
import { Progress } from '@guideshot/ui/components/progress';
import { StatusBadge } from '@guideshot/ui/components/status-badge';
import { useEffect, useState } from 'react';

import { useHydrated } from '@/hooks/use-hydrated';

export type ShowcaseScene =
  | 'annotations'
  | 'automation'
  | 'diagnostics'
  | 'features'
  | 'framing'
  | 'matrix'
  | 'privacy'
  | 'responsive'
  | 'scenario'
  | 'stability';

export type ShowcaseState = 'default' | 'delayed' | 'loading';

const navigation: ReadonlyArray<{ icon: IconData; label: string }> = [
  { icon: DashboardSquare01Icon, label: 'Overview' },
  { icon: ChartLineData01Icon, label: 'Analytics' },
  { icon: Package02Icon, label: 'Projects' },
  { icon: UserGroupIcon, label: 'Members' },
];

function AppFrame({ children }: { readonly children: React.ReactNode }) {
  return (
    <section
      className="grid h-[640px] w-[360px] max-w-full overflow-hidden rounded-xl border border-card-border bg-card sm:h-[564px] sm:w-[752px] sm:grid-cols-[170px_1fr] lg:h-[576px] lg:w-[1024px]"
      data-guide-target="showcase.canvas"
    >
      <aside
        className="hidden border-r border-separator bg-surface sm:flex sm:flex-col"
        data-guide-target="responsive.sidebar"
      >
        <div className="flex h-14 items-center gap-2 border-b border-separator px-4">
          <span className="grid size-7 place-items-center rounded-md bg-foreground font-mono text-caption font-semibold text-background">
            A
          </span>
          <span className="text-card-title font-semibold">Acme</span>
        </div>
        <nav className="grid gap-1 p-3" aria-label="Acme navigation">
          {navigation.map((item, index) => (
            <Button
              className="justify-start"
              key={item.label}
              size="sm"
              type="button"
              variant={index === 0 ? 'secondary' : 'ghost'}
            >
              <Icon data-icon="inline-start" icon={item.icon} />
              {item.label}
            </Button>
          ))}
        </nav>
        <Button
          className="m-3 mt-auto justify-start"
          size="sm"
          type="button"
          variant="ghost"
        >
          <Icon data-icon="inline-start" icon={Settings01Icon} />
          Settings
        </Button>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-col">
        <header className="flex h-14 items-center gap-2 border-b border-separator px-3 sm:px-5">
          <Button
            aria-label="Open navigation"
            className="sm:hidden"
            data-guide-target="responsive.mobile-nav"
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Icon icon={Menu01Icon} />
          </Button>
          <div className="relative hidden min-w-0 max-w-[260px] flex-1 md:block">
            <Icon
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-meta"
              icon={Search01Icon}
              size={16}
            />
            <Input
              aria-label="Search workspace"
              className="h-8 pl-8"
              placeholder="Search workspace"
              readOnly
            />
          </div>
          <Badge
            className="ml-auto hidden md:inline-flex"
            data-guide-target="responsive.command"
            variant="secondary"
          >
            <Icon data-icon="inline-start" icon={CommandIcon} size={16} /> K
          </Badge>
          <Button
            aria-label="Notifications"
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Icon icon={Notification02Icon} />
          </Button>
          <span className="grid size-7 place-items-center rounded-full bg-primary-soft text-caption font-semibold text-primary">
            AK
          </span>
        </header>
        {children}
      </div>
    </section>
  );
}

function AnnotationsScene() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-page-title font-semibold tracking-page-title"
              data-guide-target="showcase.heading"
            >
              Project health
            </h1>
            <StatusBadge data-guide-target="showcase.status" tone="success">
              On track
            </StatusBadge>
          </div>
          <p className="mt-1 hidden text-body text-text-secondary sm:block">
            A stable product state for every annotation primitive.
          </p>
        </div>
        <Button data-guide-target="showcase.primary" size="sm">
          Open report
          <Icon data-icon="inline-end" icon={ArrowUpRight01Icon} />
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          ['Active users', '12.8k', '+8.2%'],
          ['Completion', '78%', '+4.1%'],
          ['Open risks', '3', '-2'],
        ].map(([label, value, change], index) => (
          <Card
            className="gap-2 p-3 sm:p-4"
            data-guide-target={index === 0 ? 'showcase.metric' : undefined}
            key={label}
            size="sm"
          >
            <p className="truncate text-caption text-text-meta">{label}</p>
            <div className="flex items-end justify-between gap-1">
              <p className="text-title font-semibold sm:text-page-title">
                {value}
              </p>
              <Badge
                data-guide-target={index === 1 ? 'showcase.badge' : undefined}
                variant="secondary"
              >
                {change}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card
        className="mt-3 min-h-0 gap-3 p-4"
        data-guide-target="showcase.panel"
        size="sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Milestone progress</CardTitle>
            <p className="mt-1 text-caption text-text-meta">
              August launch readiness
            </p>
          </div>
          <Button aria-label="More options" size="icon-sm" variant="ghost">
            <Icon icon={MoreHorizontalIcon} />
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_150px] sm:items-end">
          <div>
            <div className="mb-2 flex justify-between text-caption">
              <span>18 of 24 tasks</span>
              <span className="font-medium">75%</span>
            </div>
            <Progress value={75} />
          </div>
          <div
            className="rounded-lg border border-separator bg-surface-subtle px-3 py-2"
            data-guide-target="showcase.secret"
          >
            <p className="text-eyebrow uppercase tracking-wider text-text-meta">
              Forecast
            </p>
            <p className="mt-1 font-mono text-caption font-semibold">
              $128,400
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function FeatureScene({ feature }: { readonly feature: string }) {
  const enabled = feature !== 'control';
  const experimental = feature === 'experiment';

  return (
    <div className="grid min-h-0 flex-1 content-center gap-4 p-5 sm:p-8">
      <div>
        <Badge variant="secondary">Feature matrix</Badge>
        <h1 className="mt-3 text-page-title font-semibold tracking-page-title">
          Analytics workspace
        </h1>
        <p className="mt-1 max-w-lg text-body text-text-secondary">
          The same recipe proves every declared rollout state.
        </p>
      </div>
      <Card data-guide-target="feature.panel">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>
              {enabled ? 'Live performance insights' : 'Weekly reporting'}
            </CardTitle>
            <p className="mt-1 text-body text-text-secondary">
              {enabled
                ? 'Compare current activity with your rolling baseline.'
                : 'Export a static summary for the team.'}
            </p>
          </div>
          <StatusBadge tone={enabled ? 'success' : 'neutral'}>
            {experimental ? 'Experiment' : enabled ? 'Enabled' : 'Control'}
          </StatusBadge>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-caption text-text-meta">Workspace score</p>
            <p className="mt-1 text-[2.5rem] font-semibold tracking-[-0.05em]">
              {enabled ? (experimental ? '94' : '87') : '—'}
            </p>
          </div>
          <Button data-guide-target="feature.action">
            {enabled ? 'View insights' : 'Export report'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PrivacyScene() {
  return (
    <div className="grid min-h-0 flex-1 content-center gap-5 p-5 sm:p-8">
      <div>
        <Badge variant="secondary">Safe by construction</Badge>
        <h1 className="mt-3 text-page-title font-semibold tracking-page-title">
          Account details
        </h1>
        <p className="mt-1 text-body text-text-secondary">
          Sensitive targets can be removed before the scene enters the cache.
        </p>
      </div>
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="rounded-lg border border-separator p-4">
            <p className="text-caption text-text-meta">Email address</p>
            <p className="mt-2 font-medium" data-guide-target="privacy.email">
              alex.kim@acme.example
            </p>
          </div>
          <div className="rounded-lg border border-separator p-4">
            <p className="text-caption text-text-meta">Recovery code</p>
            <p
              className="mt-2 font-mono font-medium"
              data-guide-target="showcase.secret"
            >
              ACME-4928-JUNO
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AutomationScene() {
  const [filtered, setFiltered] = useState(false);
  const rows = filtered
    ? ['Release automation', 'Design tokens']
    : ['Release automation', 'Design tokens', 'Mobile navigation', 'Billing'];

  return (
    <div className="min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-page-title font-semibold tracking-page-title">
            Projects
          </h1>
          <p className="mt-1 text-body text-text-secondary">
            Prepare the state before capture.
          </p>
        </div>
        <Button
          data-guide-target="automation.filter"
          onClick={() => setFiltered(true)}
          size="sm"
          variant="outline"
        >
          <Icon data-icon="inline-start" icon={FilterHorizontalIcon} />
          Active only
        </Button>
      </div>
      <Card className="mt-5 gap-0 overflow-hidden py-0">
        {filtered ? (
          <div
            className="flex items-center gap-2 border-b border-separator bg-primary-soft px-4 py-2 text-control font-medium text-success"
            data-guide-target="automation.filtered"
          >
            <Icon icon={CheckmarkCircle02Icon} />
            Filter applied · 2 active projects
          </div>
        ) : null}
        <div className="divide-y divide-separator">
          {rows.map((row, index) => (
            <div
              className="flex items-center justify-between px-4 py-3"
              key={row}
            >
              <div>
                <p className="text-control font-medium">{row}</p>
                <p className="mt-0.5 text-caption text-text-meta">
                  Updated {index + 1}h ago
                </p>
              </div>
              <StatusBadge tone={index < 2 ? 'success' : 'neutral'}>
                {index < 2 ? 'Active' : 'Draft'}
              </StatusBadge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ResponsiveScene() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden p-3 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-title font-semibold tracking-title sm:text-page-title sm:tracking-page-title">
            Workspace
          </h1>
          <p className="mt-1 hidden text-body text-text-secondary sm:block">
            One stable surface, captured from named viewport profiles.
          </p>
        </div>
        <Button size="sm">New project</Button>
      </div>
      <div
        className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-3"
        data-guide-target="responsive.cards"
      >
        {['Growth', 'Platform', 'Mobile'].map((name, index) => (
          <Card
            className={`gap-2 p-3 sm:p-4 ${index === 2 ? 'hidden sm:flex' : ''}`}
            key={name}
            size="sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="grid size-7 place-items-center rounded-md bg-primary-soft text-caption font-semibold text-primary">
                {name[0]}
              </span>
              <StatusBadge tone="success">Active</StatusBadge>
            </div>
            <CardTitle>{name}</CardTitle>
            <p className="text-caption text-text-meta">6 collaborators</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ScenarioScene({
  sessionValue,
}: {
  readonly sessionValue: string | null;
}) {
  const session = sessionValue
    ? (JSON.parse(sessionValue) as {
        readonly role: string;
        readonly user: string;
        readonly workspace: string;
      })
    : null;

  return (
    <div className="grid min-h-0 flex-1 content-center gap-5 p-5 sm:p-8">
      <div>
        <Badge variant="secondary">
          {session ? 'Authenticated scenario' : 'Public state'}
        </Badge>
        <h1 className="mt-3 text-page-title font-semibold tracking-page-title">
          {session ? session.workspace : 'Welcome to Acme'}
        </h1>
        <p className="mt-1 text-body text-text-secondary">
          {session
            ? 'Synthetic identity and workspace state were installed before navigation.'
            : 'No session was prepared for this browser context.'}
        </p>
      </div>
      <Card data-guide-target="scenario.workspace">
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
          {[
            ['User', session?.user ?? 'Guest'],
            ['Role', session?.role ?? 'None'],
            ['Workspace', session?.workspace ?? 'Public'],
          ].map(([label, value]) => (
            <div className="rounded-lg border border-separator p-4" key={label}>
              <p className="text-caption text-text-meta">{label}</p>
              <p
                className="mt-2 font-medium"
                data-guide-target={
                  label === 'User' ? 'scenario.user' : undefined
                }
              >
                {value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function FramingScene() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="secondary">Quarterly review</Badge>
          <h1 className="mt-3 text-page-title font-semibold tracking-page-title">
            Revenue health
          </h1>
          <p className="mt-1 text-body text-text-secondary">
            Choose exactly how much surrounding product context to publish.
          </p>
        </div>
        <Button data-guide-target="framing.action" size="sm">
          Export report
        </Button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1.4fr_0.6fr]">
        <Card data-guide-target="framing.panel">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-28 items-end gap-2">
              {[42, 56, 48, 72, 66, 88, 82, 96].map((height, index) => (
                <span
                  className="flex-1 rounded-t bg-primary-soft"
                  key={index}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="justify-center" data-guide-target="framing.metric">
          <CardContent>
            <p className="text-caption text-text-meta">Net revenue</p>
            <p className="mt-2 text-[2.3rem] font-semibold tracking-[-0.05em]">
              $428k
            </p>
            <StatusBadge tone="success">+12.4%</StatusBadge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MatrixScene({
  feature,
  plan,
  role,
}: {
  readonly feature: string;
  readonly plan: string;
  readonly role: string;
}) {
  const canEdit = role === 'editor' || role === 'admin';
  const canManage =
    role === 'admin' && plan === 'pro' && feature === 'experiment';

  return (
    <div className="grid min-h-0 flex-1 content-center gap-5 p-5 sm:p-8">
      <div>
        <Badge variant="secondary">Role and plan matrix</Badge>
        <h1 className="mt-3 text-page-title font-semibold tracking-page-title">
          Team permissions
        </h1>
        <p className="mt-1 text-body text-text-secondary">
          This artifact proves the declared {feature} · {role} · {plan}{' '}
          combination.
        </p>
      </div>
      <Card data-guide-target="matrix.permissions">
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-3">
          {[
            ['View projects', true],
            ['Edit projects', canEdit],
            ['Manage billing', canManage],
          ].map(([label, allowed]) => (
            <div
              className="rounded-lg border border-separator p-4"
              key={String(label)}
            >
              <StatusBadge tone={allowed ? 'success' : 'neutral'}>
                {allowed ? 'Available' : 'Unavailable'}
              </StatusBadge>
              <p className="mt-3 text-control font-medium">{label}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StabilityScene({ state }: { readonly state: ShowcaseState }) {
  const [ready, setReady] = useState(state === 'default');

  useEffect(() => {
    if (state !== 'delayed') return;
    const timer = window.setTimeout(() => setReady(true), 650);
    return () => window.clearTimeout(timer);
  }, [state]);

  return (
    <div className="grid min-h-0 flex-1 content-center gap-5 p-5 sm:p-8">
      <div>
        <Badge variant="secondary">Deterministic loading</Badge>
        <h1 className="mt-3 text-page-title font-semibold tracking-page-title">
          Activity report
        </h1>
        <p className="mt-1 text-body text-text-secondary">
          Readiness checks decide which product state is safe to publish.
        </p>
      </div>
      {ready ? (
        <Card data-guide-target="stability.card">
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <StatusBadge tone="success">Data synchronized</StatusBadge>
              <p
                className="mt-3 text-title font-semibold"
                data-guide-target="stability.ready"
              >
                1,284 active sessions
              </p>
              <p className="mt-1 text-body text-text-secondary">
                Updated from the fixed documentation dataset.
              </p>
            </div>
            <Button>Open activity</Button>
          </CardContent>
        </Card>
      ) : (
        <Card data-guide-target="stability.loading">
          <CardContent className="grid gap-3 pt-6">
            <span className="h-4 w-24 animate-pulse rounded bg-separator motion-reduce:animate-none" />
            <span className="h-8 w-48 animate-pulse rounded bg-separator motion-reduce:animate-none" />
            <span className="h-4 w-full animate-pulse rounded bg-separator motion-reduce:animate-none" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const diagnosticCopy = {
  missing: [
    'TARGET_NOT_FOUND',
    'Add the expected data-guide-target to the product element.',
  ],
  duplicate: [
    'TARGET_AMBIGUOUS',
    'Give each visible target name one unambiguous owner.',
  ],
  hidden: [
    'TARGET_NOT_VISIBLE',
    'Prepare the state that makes the target visible before capture.',
  ],
  unstable: [
    'CAPTURE_UNSTABLE',
    'Wait for loading, animation, and layout movement to settle.',
  ],
  origin: [
    'ORIGIN_NOT_ALLOWED',
    'Add the exact trusted application origin to safety.allowedOrigins.',
  ],
} as const;

function DiagnosticsScene({ diagnostic }: { readonly diagnostic: string }) {
  const [code, remedy] =
    diagnosticCopy[diagnostic as keyof typeof diagnosticCopy] ??
    diagnosticCopy.missing;

  return (
    <div className="grid min-h-0 flex-1 content-center gap-5 p-5 sm:p-8">
      <div>
        <Badge variant="secondary">Actionable diagnostics</Badge>
        <h1 className="mt-3 text-page-title font-semibold tracking-page-title">
          Capture stopped safely
        </h1>
        <p className="mt-1 text-body text-text-secondary">
          A stable code, exact recipe context, and one corrective action replace
          a generic timeout.
        </p>
      </div>
      <Card data-guide-target="diagnostic.result">
        <CardContent className="pt-6">
          <code className="font-mono text-control font-semibold text-destructive">
            {code}
          </code>
          <p className="mt-3 text-title font-semibold">
            release.create · release.create
          </p>
          <p className="mt-2 text-body leading-6 text-text-secondary">
            {remedy}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ShowcaseFixture({
  scene,
  state = 'default',
}: {
  readonly scene: ShowcaseScene;
  readonly state?: ShowcaseState;
}) {
  const hydrated = useHydrated();
  const feature = hydrated
    ? (localStorage.getItem('guideshot:feature') ?? 'control')
    : 'control';
  const role = hydrated
    ? (localStorage.getItem('guideshot:role') ?? 'viewer')
    : 'viewer';
  const plan = hydrated
    ? (localStorage.getItem('guideshot:plan') ?? 'starter')
    : 'starter';
  const diagnostic = hydrated
    ? (localStorage.getItem('guideshot:diagnostic') ?? 'missing')
    : 'missing';
  const session = hydrated ? localStorage.getItem('guideshot:session') : null;

  if (!hydrated) {
    return (
      <main
        className="min-h-screen bg-background"
        data-guide-target="app.loading"
      />
    );
  }

  return (
    <main
      className="grid min-h-screen place-items-center bg-background p-4 text-foreground sm:p-8"
      data-guide-target="app.ready"
    >
      <span className="hidden" data-guide-target="app.loading">
        Loading
      </span>
      <AppFrame>
        {scene === 'annotations' ? <AnnotationsScene /> : null}
        {scene === 'features' ? <FeatureScene feature={feature} /> : null}
        {scene === 'privacy' ? <PrivacyScene /> : null}
        {scene === 'automation' ? <AutomationScene /> : null}
        {scene === 'responsive' ? <ResponsiveScene /> : null}
        {scene === 'scenario' ? <ScenarioScene sessionValue={session} /> : null}
        {scene === 'framing' ? <FramingScene /> : null}
        {scene === 'matrix' ? (
          <MatrixScene feature={feature} plan={plan} role={role} />
        ) : null}
        {scene === 'stability' ? <StabilityScene state={state} /> : null}
        {scene === 'diagnostics' ? (
          <DiagnosticsScene diagnostic={diagnostic} />
        ) : null}
      </AppFrame>
    </main>
  );
}
