import { PublicManifestSchema } from '@guideshot/schema';

export function GET() {
  return Response.json(PublicManifestSchema, {
    headers: { 'Cache-Control': 'public, max-age=3600, immutable' },
  });
}
