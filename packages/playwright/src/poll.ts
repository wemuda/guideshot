export async function pollUntil(
  predicate: () => boolean | Promise<boolean>,
  timeoutMs: number,
  intervalMs = 50,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  do {
    if (await predicate()) return true;
    await delay(Math.min(intervalMs, Math.max(0, deadline - Date.now())));
  } while (Date.now() < deadline);
  return predicate();
}

export function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
