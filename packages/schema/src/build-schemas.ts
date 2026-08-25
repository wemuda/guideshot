import { verifySchemas, writeSchemas } from './write-schemas.js';

const outputDirectory = process.argv[2];

if (outputDirectory === undefined) {
  throw new Error('Usage: build-schemas <output-directory>');
}

await writeSchemas(outputDirectory);
await verifySchemas(outputDirectory);
