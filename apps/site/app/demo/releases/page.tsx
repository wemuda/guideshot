import { ReleaseFixture } from '@/components/release-fixture';

const releaseSteps = ['create', 'review', 'publish'] as const;

type ReleaseStep = (typeof releaseSteps)[number];

function isReleaseStep(value: string | undefined): value is ReleaseStep {
  return releaseSteps.includes(value as ReleaseStep);
}

export default async function ReleaseFixturePage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  return <ReleaseFixture step={isReleaseStep(step) ? step : 'create'} />;
}
