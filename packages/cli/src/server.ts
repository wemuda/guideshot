import type { ServerConfig } from '@guideshot/core';
import { assertAllowedOrigin, GuideShotError } from '@guideshot/core';
import { execaCommand } from 'execa';

interface ChildHandle extends PromiseLike<unknown> {
  readonly exitCode?: number | null;
  kill(signal?: NodeJS.Signals | number): boolean;
}

export interface ServerHandle {
  readonly baseUrl: URL;
  readonly owned: boolean;
  close(): Promise<void>;
}

export async function ensureServer(input: {
  readonly config: ServerConfig;
  readonly allowedOrigins?: readonly string[];
  readonly cwd: string;
  readonly fetch: typeof globalThis.fetch;
  readonly signal?: AbortSignal;
}): Promise<ServerHandle> {
  const baseUrl = assertAllowedOrigin(
    input.config.url,
    input.allowedOrigins ?? [],
  );
  if (await probeServer(baseUrl, input.fetch, input.signal)) {
    return { baseUrl, owned: false, close: () => Promise.resolve() };
  }
  if (input.config.command === undefined) {
    throw new GuideShotError(
      'SERVER_NOT_READY',
      `Server "${baseUrl.href}" is not reachable and no start command is configured.`,
    );
  }

  const child: ChildHandle = execaCommand(input.config.command, {
    cwd: input.cwd,
    cleanup: true,
    preferLocal: true,
    reject: false,
    stdin: 'ignore',
    stdout: 'ignore',
    stderr: 'ignore',
  });
  let exited = false;
  void Promise.resolve(child).then(
    () => {
      exited = true;
    },
    () => {
      exited = true;
    },
  );

  try {
    const timeoutMs = input.config.timeoutMs ?? 30_000;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      throwIfAborted(input.signal);
      if (exited) {
        throw new GuideShotError(
          'SERVER_NOT_READY',
          `Owned server exited before "${baseUrl.href}" became ready.`,
          { details: { exitCode: child.exitCode ?? -1 } },
        );
      }
      if (await probeServer(baseUrl, input.fetch, input.signal)) {
        return {
          baseUrl,
          owned: true,
          close: () => stopChild(child),
        };
      }
      await delay(
        Math.min(125, Math.max(1, deadline - Date.now())),
        input.signal,
      );
    }
    throw new GuideShotError(
      'SERVER_NOT_READY',
      `Server "${baseUrl.href}" did not become ready within ${timeoutMs}ms.`,
    );
  } catch (error) {
    await stopChild(child);
    throw error;
  }
}

async function probeServer(
  url: URL,
  fetcher: typeof globalThis.fetch,
  signal?: AbortSignal,
): Promise<boolean> {
  throwIfAborted(signal);
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout>;
  const timedOut = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new Error('Server probe timed out.'));
    }, 1_000);
  });
  const abort = () => controller.abort(signal?.reason);
  signal?.addEventListener('abort', abort, { once: true });
  try {
    const response = await Promise.race([
      fetcher(url, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
      }),
      timedOut,
    ]);
    await response.body?.cancel();
    return response.status < 500;
  } catch {
    throwIfAborted(signal);
    return false;
  } finally {
    clearTimeout(timeout!);
    signal?.removeEventListener('abort', abort);
  }
}

async function stopChild(child: ChildHandle): Promise<void> {
  try {
    child.kill('SIGTERM');
  } catch {
    return;
  }

  const stopped = await Promise.race([
    Promise.resolve(child).then(
      () => true,
      () => true,
    ),
    delay(2_000).then(() => false),
  ]);
  if (stopped) return;
  try {
    child.kill('SIGKILL');
  } catch {
    return;
  }
  await Promise.resolve(child).catch(() => undefined);
}

function delay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted === true) {
      reject(abortError(signal));
      return;
    }
    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);
    const abort = () => {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
      reject(abortError(signal));
    };
    signal?.addEventListener('abort', abort, { once: true });
  });
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted === true) throw abortError(signal);
}

function abortError(signal?: AbortSignal): GuideShotError {
  return new GuideShotError(
    'CAPTURE_FAILED',
    'GuideShot operation was cancelled.',
    {
      cause: signal?.reason,
    },
  );
}
