import {
  CheckmarkCircle02Icon,
  Shield02Icon,
} from '@hugeicons/core-free-icons';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@guideshot/ui/components/alert';
import { Icon } from '@guideshot/ui/components/icon';
import type { Metadata } from 'next';

import { DocsPage, DocsSection } from '@/components/docs-page';

export const metadata: Metadata = {
  title: 'Security',
  description: 'Keep captured application state synthetic and publishable.',
};

const protections = [
  'Allow only the exact application origins required for capture.',
  'Use synthetic users, workspaces, and tokens created for documentation.',
  'Mask sensitive targets before the raw capture enters the cache.',
  'Use composition redactions for fields that should disappear from the published artifact.',
  'Keep caches, traces, and detailed run reports private and access-controlled.',
] as const;

export default function SecurityPage() {
  return (
    <DocsPage
      description="You will know where captured state can contain sensitive data and how to keep raw scenes, caches, and published artifacts safe."
      href="/docs/security"
      title="Safe input before beautiful output."
    >
      <DocsSection title="The trust boundary">
        <Alert>
          <Icon icon={Shield02Icon} />
          <AlertTitle>Project adapters are trusted repository code</AlertTitle>
          <AlertDescription>
            Recipes remain data. Authentication, seed state, roles, and feature
            flags live in reviewed scenarios and dimensions where normal code
            ownership and secret handling apply.
          </AlertDescription>
        </Alert>
      </DocsSection>

      <DocsSection
        description="Apply protection as early as possible. A value masked before caching cannot leak through later recomposition."
        title="Privacy layers"
      >
        <ul className="grid gap-3">
          {protections.map((item) => (
            <li className="flex gap-3 text-foreground" key={item}>
              <Icon
                className="mt-1 shrink-0 text-success"
                icon={CheckmarkCircle02Icon}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </DocsSection>
    </DocsPage>
  );
}
