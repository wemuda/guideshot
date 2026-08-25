import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const samples = {
  recipe: `{
  "version": 1,
  "id": "pilot.recipes.create",
  "profile": "guide.desktop",
  "scenario": { "use": "pilot:authenticated" },
  "page": { "path": "/demo/recipes" },
  "matrix": {
    "dimensions": {
      "locale": ["en", "da", "nb"],
      "theme": ["light", "dark"]
    }
  },
  "prepare": [
    { "do": "click", "target": "recipes.create" }
  ]
}`,
  config: `export default defineConfig({
  recipes: ['shots/**/*.shot.json'],
  server: { url: 'http://localhost:3000' },
  safety: {
    allowedOrigins: ['http://localhost:3000']
  },
  scenarios: {
    'pilot:authenticated': authenticatedPilot
  }
})`,
  cli: `guideshot validate
guideshot plan --id pilot.recipes.create
guideshot capture

✓ 6 variants captured
✓ manifest.json published`,
} as const;

function Snippet({ children }: { children: string }) {
  return (
    <pre className="min-h-[310px] overflow-x-auto rounded-xl bg-[#0f1218] p-5 text-[12px] leading-6 text-[#e8e6df] sm:p-6 sm:text-[13px]">
      <code>{children}</code>
    </pre>
  );
}

export function CodeSample() {
  return (
    <Tabs defaultValue="recipe">
      <TabsList aria-label="Code sample">
        <TabsTrigger value="recipe">recipe.json</TabsTrigger>
        <TabsTrigger value="config">guideshot.config.ts</TabsTrigger>
        <TabsTrigger value="cli">CLI</TabsTrigger>
      </TabsList>
      <TabsContent value="recipe">
        <Snippet>{samples.recipe}</Snippet>
      </TabsContent>
      <TabsContent value="config">
        <Snippet>{samples.config}</Snippet>
      </TabsContent>
      <TabsContent value="cli">
        <Snippet>{samples.cli}</Snippet>
      </TabsContent>
    </Tabs>
  );
}
