import manifestJson from '@/public/generated/guideshot/manifest.json';
import annotationArrow from '@/shots/showcase.annotation.arrow.shot.json';
import annotationCallout from '@/shots/showcase.annotation.callout.shot.json';
import annotationLabel from '@/shots/showcase.annotation.label.shot.json';
import annotationMarker from '@/shots/showcase.annotation.marker.shot.json';
import annotationOutline from '@/shots/showcase.annotation.outline.shot.json';
import annotationRedaction from '@/shots/showcase.annotation.redaction.shot.json';
import annotationSpotlight from '@/shots/showcase.annotation.spotlight.shot.json';
import automationAfter from '@/shots/showcase.automation.after.shot.json';
import automationBefore from '@/shots/showcase.automation.before.shot.json';
import connectorCenter from '@/shots/showcase.connector.center.shot.json';
import connectorEdge from '@/shots/showcase.connector.edge.shot.json';
import connectorStandalone from '@/shots/showcase.connector.standalone.shot.json';
import emphasisOutline from '@/shots/showcase.emphasis.outline.shot.json';
import emphasisPlain from '@/shots/showcase.emphasis.plain.shot.json';
import emphasisSpotlight from '@/shots/showcase.emphasis.spotlight.shot.json';
import featureFlags from '@/shots/showcase.feature-flags.shot.json';
import diagnostics from '@/shots/showcase.diagnostics.shot.json';
import framingAround from '@/shots/showcase.framing.around.shot.json';
import framingPage from '@/shots/showcase.framing.page.shot.json';
import framingRegion from '@/shots/showcase.framing.region.shot.json';
import framingTarget from '@/shots/showcase.framing.target.shot.json';
import framingViewport from '@/shots/showcase.framing.viewport.shot.json';
import matrixCapabilities from '@/shots/showcase.matrix.capabilities.shot.json';
import privacyMask from '@/shots/showcase.privacy.mask.shot.json';
import privacyRedaction from '@/shots/showcase.privacy.redaction.shot.json';
import responsiveDesktop from '@/shots/showcase.responsive.desktop.shot.json';
import responsiveMobile from '@/shots/showcase.responsive.mobile.shot.json';
import responsiveTablet from '@/shots/showcase.responsive.tablet.shot.json';
import scenarioAuthenticated from '@/shots/showcase.scenario.authenticated.shot.json';
import scenarioPublic from '@/shots/showcase.scenario.public.shot.json';
import stabilityLoading from '@/shots/showcase.stability.loading.shot.json';
import stabilityReady from '@/shots/showcase.stability.ready.shot.json';

import type {
  RecipeExampleDefinition,
  RecipeExampleStep,
  RecipeExampleStepContent,
} from '@/components/recipe-example';
import { highlightCode } from '@/lib/highlight-code';

interface RecipeSource {
  readonly id: string;
  readonly source: unknown;
  readonly title: string;
}

interface StepSource extends RecipeSource {
  readonly content: RecipeExampleStepContent;
}

function createStep(step: StepSource): RecipeExampleStep {
  const entry = manifestJson.entries.find((item) => item.id === step.id);
  const variants = Object.fromEntries(
    Object.entries(
      (entry?.variants ?? {}) as Readonly<
        Record<string, RecipeExampleStep['variants'][string]>
      >,
    ).map(([key, variant]) => [
      key,
      {
        ...variant,
        src: `/generated/guideshot/${variant.src.replace(/^\.\//, '')}`,
      },
    ]),
  );

  return {
    id: step.id,
    variants,
    content: { default: step.content },
  };
}

async function createRecipes(sources: readonly RecipeSource[]) {
  return Promise.all(
    sources.map(async (recipe) => ({
      ...recipe,
      highlightedSource: await highlightCode(
        JSON.stringify(recipe.source, null, 2),
        'json',
      ),
    })),
  );
}

async function createExample(
  definition: Omit<RecipeExampleDefinition, 'recipes' | 'steps'> & {
    readonly steps: readonly StepSource[];
  },
): Promise<RecipeExampleDefinition> {
  return {
    ...definition,
    recipes: await createRecipes(definition.steps),
    steps: definition.steps.map(createStep),
  };
}

const annotationSteps = [
  {
    id: 'showcase.annotation.callout',
    title: 'Callout',
    source: annotationCallout,
    content: {
      title: 'Callout',
      description:
        'Attach durable explanatory copy to one stable product target.',
      instructions: ['Name the target', 'Place the explanation'],
    },
  },
  {
    id: 'showcase.annotation.arrow',
    title: 'Arrow',
    source: annotationArrow,
    content: {
      title: 'Arrow',
      description:
        'Point to the target without adding a separate text container.',
      instructions: ['Select a target', 'Choose a placement side'],
    },
  },
  {
    id: 'showcase.annotation.spotlight',
    title: 'Spotlight',
    source: annotationSpotlight,
    content: {
      title: 'Spotlight',
      description:
        'Dim competing context while preserving the full product state.',
      instructions: ['Target the important region', 'Set breathing room'],
    },
  },
  {
    id: 'showcase.annotation.outline',
    title: 'Outline',
    source: annotationOutline,
    content: {
      title: 'Outline',
      description:
        'Draw a precise boundary around a control, panel, or product region.',
      instructions: ['Target the boundary', 'Tune the padding'],
    },
  },
  {
    id: 'showcase.annotation.marker',
    title: 'Marker',
    source: annotationMarker,
    content: {
      title: 'Marker',
      description:
        'Add a compact numbered or symbolic point for sequential guides.',
      instructions: ['Add concise content', 'Anchor it beside the target'],
    },
  },
  {
    id: 'showcase.annotation.label',
    title: 'Label',
    source: annotationLabel,
    content: {
      title: 'Label',
      description:
        'Name a product element without the visual weight of a callout.',
      instructions: ['Write a short label', 'Keep placement explicit'],
    },
  },
  {
    id: 'showcase.annotation.redaction',
    title: 'Redaction',
    source: annotationRedaction,
    content: {
      title: 'Redaction',
      description:
        'Remove a value from the composed artifact while retaining its layout.',
      instructions: ['Target the sensitive value', 'Apply safe padding'],
    },
  },
] as const;

const connectorSteps = [
  {
    id: 'showcase.connector.edge',
    title: 'Edge anchor',
    source: connectorEdge,
    content: {
      title: 'Edge anchor',
      description:
        'Terminate the connector at the nearest target boundary for a clean relationship.',
      instructions: ['Set connector to arrow', 'Anchor at the edge'],
    },
  },
  {
    id: 'showcase.connector.center',
    title: 'Center anchor',
    source: connectorCenter,
    content: {
      title: 'Center anchor',
      description:
        'Aim through the target center when the whole control is the subject.',
      instructions: ['Set connector to arrow', 'Anchor at the center'],
    },
  },
  {
    id: 'showcase.connector.standalone',
    title: 'Standalone',
    source: connectorStandalone,
    content: {
      title: 'Standalone arrow',
      description:
        'Use an arrow as its own annotation when explanatory copy is unnecessary.',
      instructions: ['Choose the target', 'Choose direction and offset'],
    },
  },
] as const;

const emphasisSteps = [
  {
    id: 'showcase.emphasis.plain',
    title: 'Plain',
    source: emphasisPlain,
    content: {
      title: 'Plain callout',
      description:
        'Keep the full interface at equal visual weight when context matters.',
      instructions: ['Capture the clean state', 'Compose the callout'],
    },
  },
  {
    id: 'showcase.emphasis.spotlight',
    title: 'Spotlight',
    source: emphasisSpotlight,
    content: {
      title: 'Spotlight emphasis',
      description:
        'Pair a callout with a spotlight to suppress competing interface details.',
      instructions: ['Reuse the same capture', 'Add spotlight emphasis'],
    },
  },
  {
    id: 'showcase.emphasis.outline',
    title: 'Outline',
    source: emphasisOutline,
    content: {
      title: 'Outline emphasis',
      description:
        'Pair a callout with an outline when the target boundary should remain visible.',
      instructions: ['Reuse the same capture', 'Add outline emphasis'],
    },
  },
] as const;

const featureSteps = [
  {
    id: 'showcase.feature-flags',
    title: 'Feature states',
    source: featureFlags,
    content: {
      title: 'Feature flag matrix',
      description:
        'Publish control, enabled, and experiment states from one declarative recipe.',
      instructions: [
        'Declare the feature dimension',
        'Capture every rollout state',
      ],
    },
  },
] as const;

const privacySteps = [
  {
    id: 'showcase.privacy.mask',
    title: 'Capture mask',
    source: privacyMask,
    content: {
      title: 'Mask before caching',
      description:
        'Targets in the privacy namespace are hidden before the raw scene is persisted.',
      instructions: ['Mark the sensitive target', 'Capture a safe scene'],
    },
  },
  {
    id: 'showcase.privacy.redaction',
    title: 'Redaction',
    source: privacyRedaction,
    content: {
      title: 'Redact during composition',
      description:
        'Add a redaction to a known target when the published artifact needs extra protection.',
      instructions: ['Reuse the safe scene', 'Compose the redaction'],
    },
  },
] as const;

const responsiveSteps = [
  {
    id: 'showcase.responsive.desktop',
    title: 'Desktop',
    source: responsiveDesktop,
    content: {
      title: 'Desktop profile',
      description:
        'A 1280×960 browser viewport publishes a true 16:9 desktop artifact.',
      instructions: ['1920×1080 output', 'Persistent navigation is visible'],
    },
  },
  {
    id: 'showcase.responsive.tablet',
    title: 'Tablet',
    source: responsiveTablet,
    content: {
      title: 'Tablet profile',
      description:
        'An 820×900 browser viewport publishes a 4:3 tablet artifact.',
      instructions: ['1600×1200 output', 'Compact command access is visible'],
    },
  },
  {
    id: 'showcase.responsive.mobile',
    title: 'Mobile',
    source: responsiveMobile,
    content: {
      title: 'Mobile profile',
      description:
        'A 390×844 browser viewport publishes a portrait 9:16 artifact.',
      instructions: [
        '1080×1920 output',
        'Mobile navigation replaces the sidebar',
      ],
    },
  },
] as const;

const automationSteps = [
  {
    id: 'showcase.automation.before',
    title: 'Before',
    source: automationBefore,
    content: {
      title: 'Start from a clean context',
      description:
        'The fixture begins with all projects visible and the filter action ready.',
      instructions: ['Open an isolated context', 'Resolve the stable target'],
    },
  },
  {
    id: 'showcase.automation.after',
    title: 'Prepared',
    source: automationAfter,
    content: {
      title: 'Prepare, then verify',
      description:
        'Typed actions create the state and readiness checks prove it before capture.',
      instructions: ['Click Active only', 'Wait for the verified result'],
    },
  },
] as const;

const scenarioSteps = [
  {
    id: 'showcase.scenario.public',
    title: 'Public state',
    source: scenarioPublic,
    content: {
      title: 'Start without a session',
      description:
        'A fresh browser context shows the product exactly as an unauthenticated visitor sees it.',
      instructions: [
        'No session is installed',
        'The public workspace is visible',
      ],
    },
  },
  {
    id: 'showcase.scenario.authenticated',
    title: 'Authenticated',
    source: scenarioAuthenticated,
    content: {
      title: 'Install synthetic state',
      description:
        'A reviewed scenario installs a synthetic user, role, and workspace before the page loads.',
      instructions: [
        'Prepare the isolated session',
        'Verify the named workspace',
      ],
    },
  },
] as const;

const framingSteps = [
  {
    id: 'showcase.framing.viewport',
    title: 'Viewport',
    source: framingViewport,
    content: {
      title: 'Show the browser view',
      description:
        'Use the viewport when the surrounding application shell is part of the explanation.',
      instructions: [
        'Capture the visible browser area',
        'Keep full navigation context',
      ],
    },
  },
  {
    id: 'showcase.framing.page',
    title: 'Page',
    source: framingPage,
    content: {
      title: 'Show the complete page',
      description:
        'Use page framing when content below the fold is meaningful to the reader.',
      instructions: [
        'Measure the complete document',
        'Publish the full product flow',
      ],
    },
  },
  {
    id: 'showcase.framing.target',
    title: 'Target',
    source: framingTarget,
    content: {
      title: 'Focus on one product region',
      description:
        'A stable target creates a focused widescreen artifact without a fragile crop.',
      instructions: ['Resolve the revenue panel', 'Expand to a 16:9 frame'],
    },
  },
  {
    id: 'showcase.framing.around',
    title: 'Related targets',
    source: framingAround,
    content: {
      title: 'Keep related context together',
      description:
        'Frame multiple targets when the relationship between them is the point of the guide.',
      instructions: [
        'Resolve the trend and metric',
        'Fit both into a 4:3 artifact',
      ],
    },
  },
  {
    id: 'showcase.framing.region',
    title: 'Region',
    source: framingRegion,
    content: {
      title: 'Publish an explicit region',
      description:
        'Use coordinates only when the region is an intentional, stable project contract.',
      instructions: ['Declare the fixed region', 'Expand without distortion'],
    },
  },
] as const;

const matrixSteps = [
  {
    id: 'showcase.matrix.capabilities',
    title: 'Capability matrix',
    source: matrixCapabilities,
    content: {
      title: 'Publish only supported audiences',
      description:
        'One recipe expands into the feature, role, and plan combinations the product actually supports.',
      instructions: [
        'Exclude impossible combinations',
        'Include the explicit control baseline',
      ],
    },
  },
] as const;

const stabilitySteps = [
  {
    id: 'showcase.stability.loading',
    title: 'Loading',
    source: stabilityLoading,
    content: {
      title: 'Loading can be intentional',
      description:
        'This recipe deliberately publishes the product skeleton as an observable state.',
      instructions: [
        'Wait for the loading target',
        'Capture the declared state',
      ],
    },
  },
  {
    id: 'showcase.stability.ready',
    title: 'Ready',
    source: stabilityReady,
    content: {
      title: 'Wait for meaningful data',
      description:
        'The second recipe waits until the fixed dataset and expected text are both visible.',
      instructions: ['Wait for the result target', 'Verify the expected value'],
    },
  },
] as const;

const diagnosticSteps = [
  {
    id: 'showcase.diagnostics',
    title: 'Diagnostic',
    source: diagnostics,
    content: {
      title: 'Turn failures into corrective actions',
      description:
        'Each diagnostic keeps a stable code while the message names the failed contract and a practical remedy.',
      instructions: [
        'Identify the stable code',
        'Apply the stated corrective action',
      ],
    },
  },
] as const;

export async function createStoryShowcaseExamples() {
  return Promise.all([
    createExample({
      id: 'responsive-profiles',
      title: 'Device-specific artifacts',
      description:
        'Publish a wide desktop guide, a 4:3 tablet guide, and a portrait phone guide from explicit profiles and artifact ratios.',
      context:
        'The same workspace presented at desktop, tablet, and mobile sizes.',
      proof:
        'The browser viewport and final artifact ratio are independent, validated contracts.',
      changes:
        'Navigation, density, intrinsic dimensions, and aspect ratio change by device.',
      properties: [],
      steps: responsiveSteps,
    }),
    createExample({
      id: 'prepared-state',
      title: 'Authenticated and prepared state',
      description:
        'Start with an isolated browser, install a synthetic session, perform a real action, and prove the result before capture.',
      context:
        'A public workspace, an authenticated workspace, and a projects list before and after filtering.',
      proof:
        'Scenarios establish safe domain state while typed actions and readiness checks establish visible UI state.',
      changes:
        'Identity, workspace access, visible rows, and the verified confirmation change.',
      properties: [],
      steps: [...scenarioSteps, ...automationSteps],
      defaultStep: 1,
    }),
    createExample({
      id: 'framing-context',
      title: 'Frame the right context',
      description:
        'Choose the full viewport, complete page, one target, related targets, or an explicit region based on what the reader needs to understand.',
      context:
        'One revenue workspace published with five deliberate framing strategies.',
      proof:
        'Stable target geometry replaces manual image cropping and keeps the requested ratio intact.',
      changes:
        'The amount of surrounding product context and the final artifact shape change.',
      properties: [],
      steps: framingSteps,
      defaultStep: 2,
    }),
    createExample({
      id: 'audience-matrix',
      title: 'Feature and role matrices',
      description:
        'Generate only supported rollout, role, and plan combinations while keeping one explicit control baseline.',
      context:
        'A permissions panel whose available actions follow the selected audience.',
      proof:
        'Matrix exclusions remove impossible states and an inclusion restores one reviewed baseline.',
      changes:
        'The rollout, role, plan, and resulting permissions change together.',
      properties: [
        {
          id: 'feature',
          label: 'Rollout',
          control: 'select',
          defaultValue: 'enabled',
          options: [
            { value: 'control', label: 'Control' },
            { value: 'enabled', label: 'Enabled' },
            { value: 'experiment', label: 'Experiment' },
          ],
        },
        {
          id: 'plan',
          label: 'Plan',
          control: 'tabs',
          defaultValue: 'starter',
          options: [
            { value: 'starter', label: 'Starter' },
            { value: 'pro', label: 'Pro' },
          ],
        },
        {
          id: 'role',
          label: 'Role',
          control: 'select',
          defaultValue: 'viewer',
          options: [
            { value: 'viewer', label: 'Viewer' },
            { value: 'editor', label: 'Editor' },
            { value: 'admin', label: 'Admin' },
          ],
        },
      ],
      steps: matrixSteps,
    }),
    createExample({
      id: 'safe-deterministic-capture',
      title: 'Privacy and deterministic loading',
      description:
        'Protect sensitive pixels before caching and wait for the exact loading or ready state the guide intends to publish.',
      context:
        'Synthetic account data plus an activity report in explicit loading and ready states.',
      proof:
        'Capture masks protect raw scenes, redactions protect output, and readiness assertions prevent timing races.',
      changes:
        'The protection layer and the declared application readiness state change.',
      properties: [],
      steps: [...privacySteps, ...stabilitySteps],
    }),
    createExample({
      id: 'actionable-diagnostics',
      title: 'Actionable diagnostics',
      description:
        'Replace generic capture timeouts with stable error codes, exact recipe context, and one corrective action.',
      context:
        'A capture report for missing, duplicated, hidden, unstable, or untrusted product state.',
      proof:
        'Failures are typed early enough for people and agents to respond consistently.',
      changes:
        'The diagnostic code, failed contract, and recommended correction change.',
      properties: [
        {
          id: 'diagnostic',
          label: 'Failure',
          control: 'select',
          defaultValue: 'missing',
          options: [
            { value: 'missing', label: 'Missing target' },
            { value: 'duplicate', label: 'Duplicate target' },
            { value: 'hidden', label: 'Hidden target' },
            { value: 'unstable', label: 'Unstable scene' },
            { value: 'origin', label: 'Blocked origin' },
          ],
        },
      ],
      steps: diagnosticSteps,
    }),
  ]);
}

export async function createReferenceExamples() {
  return Promise.all([
    createExample({
      id: 'annotation-primitives',
      title: 'Annotation primitives',
      description:
        'Use these when the reader needs an explanation, direction, emphasis, sequence, label, or privacy treatment.',
      context: 'The same dashboard with one annotation primitive at a time.',
      proof:
        'Every primitive resolves against stable product geometry and renders offline.',
      changes: 'Only the annotation kind and its placement change.',
      properties: [],
      steps: annotationSteps,
    }),
    createExample({
      id: 'connector-anchors',
      title: 'Connector anchors',
      description:
        'Use an edge anchor for a clean boundary relationship, a center anchor for the whole control, or a standalone arrow when copy is unnecessary.',
      context: 'One product action with three connector treatments.',
      proof: 'Connectors remain attached to measured target geometry.',
      changes: 'The anchor and presence of explanatory copy change.',
      properties: [],
      steps: connectorSteps,
    }),
    createExample({
      id: 'emphasis-composition',
      title: 'Emphasis treatments',
      description:
        'Use plain composition when context matters, spotlight when distractions should recede, and outline when the boundary matters.',
      context: 'One clean captured scene recomposed three ways.',
      proof: 'Annotation-only edits do not require another browser capture.',
      changes: 'Only the offline emphasis layer changes.',
      properties: [],
      steps: emphasisSteps,
      defaultStep: 1,
    }),
  ]);
}

export async function createShowcaseExamples() {
  return Promise.all([
    createExample({
      id: 'annotation-primitives',
      title: 'Every supported annotation',
      description:
        'Callout, arrow, spotlight, outline, marker, label, and redaction are first-class recipe primitives rendered from stable product targets.',
      context:
        'The same project dashboard with one annotation treatment at a time.',
      proof:
        'Each primitive is resolved from a stable product target and rendered offline.',
      changes:
        'Only the annotation kind and its placement change between previews.',
      properties: [],
      steps: annotationSteps,
    }),
    createExample({
      id: 'connector-anchors',
      title: 'Connectors that stay attached',
      description:
        'Compare edge and center anchors, or remove the text box entirely and use a standalone arrow.',
      context: 'One action shown with three ways to connect visual guidance.',
      proof:
        'Connectors remain attached to measured target geometry after capture.',
      changes: 'The anchor point and presence of explanatory copy change.',
      properties: [],
      steps: connectorSteps,
    }),
    createExample({
      id: 'emphasis-composition',
      title: 'Change emphasis without recapturing',
      description:
        'Plain, spotlight, and outline compositions share one clean product state. Only the annotation layer changes.',
      context:
        'One captured dashboard recomposed with three emphasis treatments.',
      proof:
        'Annotation-only edits reuse the sanitized scene without reopening the app.',
      changes:
        'The clean capture stays identical while the composition layer changes.',
      properties: [],
      steps: emphasisSteps,
      defaultStep: 1,
    }),
    createExample({
      id: 'feature-flags',
      title: 'Feature flags as a matrix',
      description:
        'One recipe expands into control, enabled, and experiment artifacts so rollout documentation cannot drift from the product state.',
      context:
        'An analytics workspace rendered in three declared rollout states.',
      proof:
        'A feature dimension expands one recipe into a complete artifact set.',
      changes:
        'The available action, workspace score, and status follow the rollout.',
      properties: [
        {
          id: 'feature',
          label: 'Rollout',
          control: 'tabs',
          defaultValue: 'control',
          options: [
            { value: 'control', label: 'Control' },
            { value: 'enabled', label: 'Enabled' },
            { value: 'experiment', label: 'Experiment' },
          ],
        },
      ],
      steps: featureSteps,
    }),
    createExample({
      id: 'privacy-protection',
      title: 'Protect data before it becomes an artifact',
      description:
        'Capture-time masks keep sensitive values out of the raw cache; composition redactions protect additional published fields.',
      context:
        'A synthetic account screen containing fields that should not enter documentation.',
      proof:
        'Sensitive pixels can be removed before caching or redacted during composition.',
      changes:
        'The first preview protects the scene; the second protects the final artifact.',
      properties: [],
      steps: privacySteps,
    }),
    createExample({
      id: 'responsive-profiles',
      title: 'Real responsive captures',
      description:
        'Desktop, tablet, and mobile profiles load the product at explicit viewports and publish the same high-resolution output contract.',
      context:
        'The same workspace captured as a wide desktop, tablet, and portrait phone.',
      proof:
        'Profiles control the browser viewport while each recipe controls its artifact ratio.',
      changes:
        'Navigation, density, intrinsic dimensions, and aspect ratio change by device.',
      properties: [],
      steps: responsiveSteps,
      defaultStep: 2,
    }),
    createExample({
      id: 'state-automation',
      title: 'Prepare and prove application state',
      description:
        'Typed actions create the target state, then readiness assertions prevent the screenshot from racing the interface.',
      context:
        'A projects screen before and after applying an Active-only filter.',
      proof:
        'GuideShot performs the action and verifies the resulting text before capture.',
      changes:
        'The visible rows and confirmation state change after preparation.',
      properties: [],
      steps: automationSteps,
      defaultStep: 1,
    }),
  ]);
}
