import { JsonValueSchema } from '@guideshot/schema';

export function GET() {
  return Response.json(JsonValueSchema, {
    headers: { 'Cache-Control': 'public, max-age=3600, immutable' },
  });
}
