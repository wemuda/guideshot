'use client';

import {
  Add01Icon,
  GitPullRequestIcon,
  Home01Icon,
  InboxIcon,
  Package02Icon,
  Settings01Icon,
  Tag01Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@guideshot/ui/components/button';
import { EmptyState } from '@guideshot/ui/components/state';
import { Icon, type IconData } from '@guideshot/ui/components/icon';
import { Input } from '@guideshot/ui/components/input';
import { Label } from '@guideshot/ui/components/label';
import { StatusBadge } from '@guideshot/ui/components/status-badge';
import { Textarea } from '@guideshot/ui/components/textarea';
import { useEffect } from 'react';

import { useHydrated } from '@/hooks/use-hydrated';
import {
  isReleaseGuideLocale,
  type ReleaseGuideLocale,
} from '@/lib/generated-guide';

type ReleaseStep = 'create' | 'review' | 'publish';

const fixtureCopy = {
  en: {
    releases: 'Releases',
    releasesDescription: 'Prepare and publish product updates.',
    overview: 'Overview',
    pullRequests: 'Pull requests',
    packages: 'Packages',
    releasesNav: 'Releases',
    settings: 'Settings',
    noReleases: 'No releases yet',
    noReleasesDescription:
      'Create the first release to share changes with your users.',
    createRelease: 'Create release',
    newRelease: 'New release',
    tagVersion: 'Tag version',
    target: 'Target',
    releaseNotes: 'Release notes',
    releaseNotesHelp: 'Summarize the changes people need to know about.',
    reviewChanges: 'Review changes',
    cancel: 'Cancel',
    releaseTitle: 'Release v1.3.0',
    ready: 'Ready to publish',
    summary: 'Summary',
    author: 'Author',
    updated: 'Updated',
    changes: 'Changes',
    changeOne: 'Bulk editing for project settings',
    changeTwo: 'Improved data-table performance',
    changeThree: 'Fixed the date range filter',
    publishRelease: 'Publish release',
  },
  da: {
    releases: 'Udgivelser',
    releasesDescription: 'Forbered og udgiv produktopdateringer.',
    overview: 'Overblik',
    pullRequests: 'Pull requests',
    packages: 'Pakker',
    releasesNav: 'Udgivelser',
    settings: 'Indstillinger',
    noReleases: 'Ingen udgivelser endnu',
    noReleasesDescription:
      'Opret den første udgivelse for at dele ændringer med brugerne.',
    createRelease: 'Opret udgivelse',
    newRelease: 'Ny udgivelse',
    tagVersion: 'Versionsmærke',
    target: 'Mål',
    releaseNotes: 'Udgivelsesnoter',
    releaseNotesHelp: 'Opsummer de ændringer, brugerne skal kende.',
    reviewChanges: 'Gennemgå ændringer',
    cancel: 'Annuller',
    releaseTitle: 'Udgivelse v1.3.0',
    ready: 'Klar til udgivelse',
    summary: 'Oversigt',
    author: 'Forfatter',
    updated: 'Opdateret',
    changes: 'Ændringer',
    changeOne: 'Masseredigering af projektindstillinger',
    changeTwo: 'Forbedret ydeevne i datatabeller',
    changeThree: 'Rettet filteret for datointervaller',
    publishRelease: 'Udgiv version',
  },
  nb: {
    releases: 'Utgivelser',
    releasesDescription: 'Forbered og publiser produktoppdateringer.',
    overview: 'Oversikt',
    pullRequests: 'Pull requests',
    packages: 'Pakker',
    releasesNav: 'Utgivelser',
    settings: 'Innstillinger',
    noReleases: 'Ingen utgivelser ennå',
    noReleasesDescription:
      'Opprett den første utgivelsen for å dele endringer med brukerne.',
    createRelease: 'Opprett utgivelse',
    newRelease: 'Ny utgivelse',
    tagVersion: 'Versjonsmerke',
    target: 'Mål',
    releaseNotes: 'Utgivelsesnotater',
    releaseNotesHelp: 'Oppsummer endringene brukerne trenger å vite om.',
    reviewChanges: 'Gjennomgå endringer',
    cancel: 'Avbryt',
    releaseTitle: 'Utgivelse v1.3.0',
    ready: 'Klar til publisering',
    summary: 'Sammendrag',
    author: 'Forfatter',
    updated: 'Oppdatert',
    changes: 'Endringer',
    changeOne: 'Masseredigering av prosjektinnstillinger',
    changeTwo: 'Forbedret ytelse i datatabeller',
    changeThree: 'Rettet filteret for datointervall',
    publishRelease: 'Publiser utgivelse',
  },
} as const;

type FixtureCopy = {
  [Key in keyof (typeof fixtureCopy)['en']]: string;
};

const navigation: ReadonlyArray<{
  icon: IconData;
  label: keyof FixtureCopy;
}> = [
  { icon: Home01Icon, label: 'overview' },
  { icon: GitPullRequestIcon, label: 'pullRequests' },
  { icon: Package02Icon, label: 'packages' },
  { icon: Tag01Icon, label: 'releasesNav' },
  { icon: Settings01Icon, label: 'settings' },
];

function CreateRelease({ copy }: { copy: FixtureCopy }) {
  return (
    <EmptyState
      action={
        <Button data-guide-target="release.create" size="lg">
          <Icon data-icon="inline-start" icon={Add01Icon} />
          {copy.createRelease}
        </Button>
      }
      className="h-full min-h-0"
      description={copy.noReleasesDescription}
      icon={<Icon icon={InboxIcon} size={20} />}
      title={copy.noReleases}
    />
  );
}

function ReviewRelease({ copy }: { copy: FixtureCopy }) {
  return (
    <form
      className="mx-auto max-w-[620px] py-8"
      onSubmit={(event) => event.preventDefault()}
    >
      <h2 className="text-page-title font-semibold tracking-page-title">
        {copy.newRelease}
      </h2>
      <div className="mt-6 grid gap-5">
        <div className="grid gap-1.5">
          <Label htmlFor="release-tag">{copy.tagVersion}</Label>
          <Input id="release-tag" readOnly value="v1.3.0" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="release-target">{copy.target}</Label>
          <Input id="release-target" readOnly value="main" />
        </div>
        <div className="grid gap-1.5" data-guide-target="release.notes">
          <Label htmlFor="release-notes">{copy.releaseNotes}</Label>
          <Textarea
            id="release-notes"
            readOnly
            value={`## What's changed\n- ${copy.changeOne}\n- ${copy.changeTwo}\n- ${copy.changeThree}`}
          />
          <p className="text-caption text-text-meta">{copy.releaseNotesHelp}</p>
        </div>
      </div>
      <div className="mt-7 flex justify-end gap-2">
        <Button type="button" variant="ghost">
          {copy.cancel}
        </Button>
        <Button type="submit">{copy.reviewChanges}</Button>
      </div>
    </form>
  );
}

function PublishRelease({ copy }: { copy: FixtureCopy }) {
  return (
    <div className="mx-auto max-w-[660px] py-8">
      <div className="flex flex-col gap-4 border-b border-separator pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-page-title font-semibold tracking-page-title">
              {copy.releaseTitle}
            </h2>
            <StatusBadge tone="success">{copy.ready}</StatusBadge>
          </div>
          <p className="mt-2 text-caption text-text-meta">
            {copy.updated}: 26 Aug 2026
          </p>
        </div>
        <Button data-guide-target="release.publish" size="lg">
          {copy.publishRelease}
        </Button>
      </div>

      <div className="grid gap-8 py-6 sm:grid-cols-[180px_1fr]">
        <dl className="grid content-start gap-4 text-control">
          <div>
            <dt className="text-text-meta">{copy.target}</dt>
            <dd className="mt-1 font-medium">main</dd>
          </div>
          <div>
            <dt className="text-text-meta">{copy.tagVersion}</dt>
            <dd className="mt-1 font-medium">v1.3.0</dd>
          </div>
          <div>
            <dt className="text-text-meta">{copy.author}</dt>
            <dd className="mt-1 font-medium">Alex Kim</dd>
          </div>
        </dl>
        <div>
          <h3 className="text-card-title font-semibold">{copy.changes}</h3>
          <ul className="mt-3 grid gap-3 text-body text-text-secondary">
            {[copy.changeOne, copy.changeTwo, copy.changeThree].map(
              (change) => (
                <li className="flex gap-2" key={change}>
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1 rounded-full bg-primary"
                  />
                  {change}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ReleaseFixture({ step }: { step: ReleaseStep }) {
  const hydrated = useHydrated();
  const storedLocale = hydrated
    ? localStorage.getItem('guideshot:locale')
    : null;
  const locale: ReleaseGuideLocale = isReleaseGuideLocale(storedLocale)
    ? storedLocale
    : 'en';

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  if (!hydrated) {
    return (
      <main
        className="min-h-screen bg-background"
        data-guide-target="app.loading"
      />
    );
  }

  const copy = fixtureCopy[locale];

  return (
    <main
      className="grid min-h-screen place-items-center bg-background p-6 text-foreground sm:p-12"
      data-guide-target="app.ready"
    >
      <span className="hidden" data-guide-target="app.loading">
        Loading
      </span>
      <section
        className="grid h-[864px] w-full max-w-[1160px] overflow-hidden rounded-xl border border-card-border bg-card sm:grid-cols-[190px_1fr]"
        data-guide-target="release.canvas"
      >
        <aside className="hidden border-r border-separator bg-surface sm:flex sm:flex-col">
          <div className="flex h-16 items-center gap-2.5 border-b border-separator px-4">
            <span className="grid size-7 place-items-center rounded-md bg-foreground text-background">
              <span className="font-mono text-caption font-semibold">A</span>
            </span>
            <span className="text-card-title font-semibold">Acme</span>
          </div>
          <nav className="grid gap-1 p-3" aria-label="Acme navigation">
            {navigation.map((item) => (
              <Button
                className="justify-start"
                key={item.label}
                type="button"
                variant={item.label === 'releasesNav' ? 'secondary' : 'ghost'}
              >
                <Icon data-icon="inline-start" icon={item.icon} />
                {copy[item.label]}
              </Button>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col">
          <header className="border-b border-separator px-5 py-5 sm:px-7">
            <h1 className="text-page-title font-semibold tracking-page-title">
              {copy.releases}
            </h1>
            <p className="mt-1 text-body text-text-secondary">
              {copy.releasesDescription}
            </p>
          </header>
          <div className="min-h-0 flex-1 px-5 sm:px-7">
            {step === 'create' ? <CreateRelease copy={copy} /> : null}
            {step === 'review' ? <ReviewRelease copy={copy} /> : null}
            {step === 'publish' ? <PublishRelease copy={copy} /> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
