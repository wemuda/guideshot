import path from 'node:path';

import { GuideShotError } from './diagnostics.js';

const HTTP_PROTOCOLS = new Set(['http:', 'https:']);

export function assertAllowedOrigin(
  value: string | URL,
  allowedOrigins: readonly string[] = [],
): URL {
  const url = toUrl(value);
  if (!HTTP_PROTOCOLS.has(url.protocol)) {
    throw originError(url, 'Only HTTP and HTTPS origins are supported.');
  }
  if (url.username !== '' || url.password !== '') {
    throw originError(url, 'Credentials are not allowed in the server URL.');
  }

  const allowed = new Set(allowedOrigins.map(normalizeAllowedOrigin));
  if (!isLoopbackHostname(url.hostname) && !allowed.has(url.origin)) {
    throw originError(
      url,
      `Origin "${url.origin}" is not loopback and is not explicitly allowed.`,
    );
  }
  return url;
}

export function resolvePageUrl(baseUrl: string | URL, pagePath: string): URL {
  const base = toUrl(baseUrl);
  const resolved = new URL(pagePath, base);
  if (
    resolved.origin !== base.origin ||
    !HTTP_PROTOCOLS.has(resolved.protocol)
  ) {
    throw originError(
      resolved,
      `Page path "${pagePath}" resolves outside the configured origin.`,
    );
  }
  if (resolved.username !== '' || resolved.password !== '') {
    throw originError(resolved, 'Credentials are not allowed in page URLs.');
  }
  return resolved;
}

export interface SafeProjectPaths {
  outputDir: string;
  cacheDir: string;
}

export function resolveSafeProjectPaths(
  projectRoot: string,
  outputDir: string,
  cacheDir: string,
): SafeProjectPaths {
  const root = path.resolve(projectRoot);
  const output = resolveDescendant(root, outputDir, 'output');
  const cache = resolveDescendant(root, cacheDir, 'cache');
  if (output === cache || isInside(output, cache) || isInside(cache, output)) {
    throw new GuideShotError(
      'OUTPUT_COLLISION',
      'Output and cache directories must not overlap.',
    );
  }
  return { outputDir: output, cacheDir: cache };
}

export function resolveArtifactPath(
  outputDir: string,
  relativePath: string,
): string {
  if (path.isAbsolute(relativePath) || relativePath.includes('\0')) {
    throw unsafeOutputPath(relativePath);
  }
  const root = path.resolve(outputDir);
  const resolved = path.resolve(root, relativePath);
  if (!isInside(root, resolved)) {
    throw unsafeOutputPath(relativePath);
  }
  return resolved;
}

export function sanitizeFileSegment(value: string): string {
  const sanitized = value
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
  if (sanitized === '') {
    throw new GuideShotError(
      'OUTPUT_COLLISION',
      `Value "${value}" cannot be represented safely in an output filename.`,
    );
  }
  return sanitized;
}

function resolveDescendant(
  root: string,
  candidate: string,
  label: string,
): string {
  if (candidate.includes('\0')) {
    throw unsafeOutputPath(candidate);
  }
  const resolved = path.resolve(root, candidate);
  if (resolved === root || !isInside(root, resolved)) {
    throw new GuideShotError(
      'OUTPUT_COLLISION',
      `Configured ${label} directory must be below the project root.`,
      { details: { directory: candidate } },
    );
  }
  return resolved;
}

function isInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return (
    relative !== '' &&
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

function isLoopbackHostname(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (normalized === 'localhost' || normalized === '::1') {
    return true;
  }
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(normalized);
  if (match === null) {
    return false;
  }
  return Number(match[1]) === 127;
}

function normalizeAllowedOrigin(value: string): string {
  const url = toUrl(value);
  if (
    !HTTP_PROTOCOLS.has(url.protocol) ||
    url.username !== '' ||
    url.password !== ''
  ) {
    throw originError(url, `Invalid allowed origin "${value}".`);
  }
  return url.origin;
}

function toUrl(value: string | URL): URL {
  try {
    return value instanceof URL ? new URL(value.href) : new URL(value);
  } catch (cause) {
    throw new GuideShotError(
      'ORIGIN_NOT_ALLOWED',
      `Invalid URL "${String(value)}".`,
      {
        cause,
      },
    );
  }
}

function originError(url: URL, message: string): GuideShotError {
  return new GuideShotError('ORIGIN_NOT_ALLOWED', message, {
    details: { origin: url.origin },
  });
}

function unsafeOutputPath(value: string): GuideShotError {
  return new GuideShotError(
    'OUTPUT_COLLISION',
    `Unsafe output path "${value}".`,
  );
}
