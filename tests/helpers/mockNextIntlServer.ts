import type { getTranslations } from "next-intl/server";

export type ServerTranslator = Awaited<ReturnType<typeof getTranslations>>;
export type GetTranslationsFn = typeof getTranslations;

type GetTranslationsArg = Parameters<GetTranslationsFn>[0];

function resolveTranslationNamespace(
  namespaceOrOpts?: GetTranslationsArg,
): string | undefined {
  if (typeof namespaceOrOpts === "string") {
    return namespaceOrOpts;
  }

  return namespaceOrOpts?.namespace;
}

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function createMockServerTranslator(
  translate: TranslateFn = (key) => key,
): ServerTranslator {
  const translator = Object.assign(
    (key: string, values?: Record<string, string | number>) =>
      translate(key, values),
    {
      rich: () => "",
      markup: () => "",
      raw: () => "",
      has: () => false,
    },
  );

  return translator as ServerTranslator;
}

export function createTimelineStatusChangeTranslator(): ServerTranslator {
  return createMockServerTranslator((key, values) => {
    if (key === "statusChangeNote" && values?.from && values?.to) {
      return `${values.from}->${values.to}`;
    }
    return key;
  });
}

/** Mock compatível com overloads de `getTranslations` (namespace string ou `{ namespace }`). */
export async function mockGetTranslationsImpl(
  namespaceOrOpts?: GetTranslationsArg,
): Promise<ServerTranslator> {
  const namespace = resolveTranslationNamespace(namespaceOrOpts);

  if (namespace === "projects.overview.timeline") {
    return createTimelineStatusChangeTranslator();
  }

  return createMockServerTranslator();
}

export function asGetTranslationsMock(
  impl: typeof mockGetTranslationsImpl,
): GetTranslationsFn {
  return impl as GetTranslationsFn;
}
