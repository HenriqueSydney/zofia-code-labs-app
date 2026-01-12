export function calculateProportion(total: number, current: number): number {
  if (!total || total === 0) return 0;
  return Number(((current / total) * 100).toFixed(2));
}
