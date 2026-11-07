export function getSpeechRetryDelayMs(attempt: number, randomValue = Math.random()): number {
  const safeAttempt = Math.max(0, Math.min(4, Math.floor(attempt)));
  const safeRandom = Math.max(0, Math.min(0.999, randomValue));
  const exponentialDelay = Math.min(2_000, 250 * (2 ** safeAttempt));
  return exponentialDelay + Math.floor(safeRandom * 100);
}
