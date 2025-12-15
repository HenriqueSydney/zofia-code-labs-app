export const localeMap: Record<string, string> = {
  pt: "pt-BR", // Português (Brasil)
  en: "en-US", // Inglês (EUA)
};

// Opções padrão (caso nada seja passado)
const defaultOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};

export function formatDate(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions // 3º Parâmetro opcional
): string {
  const d = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(d.getTime())) {
    // Em UI é geralmente melhor retornar um fallback do que estourar erro,
    // mas mantive seu throw se preferir validação estrita.
    throw new Error(`Data inválida fornecida: ${date}`);
  }

  const resolvedLocale = localeMap[locale] ?? locale;

  // Usa as opções passadas OU as opções padrão de data curta
  return new Intl.DateTimeFormat(
    resolvedLocale,
    options ?? defaultOptions
  ).format(d);
}
