import { RecipeSchema } from '@guideshot/schema';

export function GET() {
  return Response.json(RecipeSchema, {
    headers: { 'Cache-Control': 'public, max-age=3600, immutable' },
  });
}
