export const now = (): number => Date.now();

export function isMatchOpen(kickoffTime: number): boolean {
  return Date.now() < kickoffTime;
}

export function formatDateUTC(ms: number): string {
  const d = new Date(ms);
  return d.toISOString();
}
