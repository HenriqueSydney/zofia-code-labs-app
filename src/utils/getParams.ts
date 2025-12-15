export async function getParams(
  searchParams:
    | Promise<Record<string, string | string[] | number | undefined>>
    | undefined,
  keys: string[]
): Promise<Record<string, string | undefined>> {
  const resolvedParams: Record<string, string | string[] | undefined> =
    await (searchParams ?? Promise.resolve({}));

  const result: Record<string, string | undefined> = {};

  keys.forEach((key) => {
    const value = resolvedParams[key];
    if (value === undefined) {
      result[key] = undefined;
    } else if (Array.isArray(value)) {
      result[key] = value.join(",");
    } else {
      result[key] = value;
    }
  });

  return result;
}
