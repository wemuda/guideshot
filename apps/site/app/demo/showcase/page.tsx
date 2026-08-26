import {
  ShowcaseFixture,
  type ShowcaseScene,
  type ShowcaseState,
} from '@/components/showcase-fixture';

const scenes: readonly ShowcaseScene[] = [
  'annotations',
  'automation',
  'diagnostics',
  'features',
  'framing',
  'matrix',
  'privacy',
  'responsive',
  'scenario',
  'stability',
];

const states: readonly ShowcaseState[] = ['default', 'delayed', 'loading'];

function isShowcaseScene(value: string | undefined): value is ShowcaseScene {
  return scenes.includes(value as ShowcaseScene);
}

function isShowcaseState(value: string | undefined): value is ShowcaseState {
  return states.includes(value as ShowcaseState);
}

export default async function ShowcaseFixturePage({
  searchParams,
}: {
  readonly searchParams: Promise<{ scene?: string; state?: string }>;
}) {
  const { scene, state } = await searchParams;
  return (
    <ShowcaseFixture
      scene={isShowcaseScene(scene) ? scene : 'annotations'}
      state={isShowcaseState(state) ? state : 'default'}
    />
  );
}
