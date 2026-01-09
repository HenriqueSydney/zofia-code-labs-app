export function calculateTrend(current: number, past?: number): number {
  if (!past || past === 0) return 0;
  return Math.round(((current - past) / past) * 100);
}
