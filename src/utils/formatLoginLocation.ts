export function formatLoginLocation(
  city: string | null,
  region: string | null,
  country: string | null,
): string {
  const parts = [city, region, country].filter(Boolean);

  if (parts.length === 0) {
    return "Desconhecida";
  }

  return parts.join(", ");
}
