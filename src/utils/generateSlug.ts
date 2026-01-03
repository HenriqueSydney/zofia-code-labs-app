interface SlugOptions {
  maxLength?: number;
  separator?: string;
  lowercase?: boolean;
  removeAccents?: boolean;
  strict?: boolean;
}

type GenerateSlug = {
  title: string;
  options?: SlugOptions;
};

export function generateSlug({ title, options }: GenerateSlug) {
  if (!title || typeof title !== "string") {
    return "";
  }

  const defaultOptions: SlugOptions = {
    maxLength: 200,
    separator: "-",
    lowercase: true,
    removeAccents: true,
    strict: false, // Se true, permite apenas a-z, 0-9 e separator
  };

  const { maxLength, separator, lowercase, removeAccents, strict } = {
    ...defaultOptions,
    ...options,
  };

  let slug = title.trim();

  // Converte para minúsculas se solicitado
  if (lowercase) {
    slug = slug.toLowerCase();
  }

  // Remove acentos se solicitado
  if (removeAccents) {
    slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  if (strict) {
    // Modo strict: apenas letras, números e separador
    slug = slug.replace(/[^a-z0-9\s-]/gi, "");
  } else {
    // Modo normal: remove apenas caracteres problemáticos para URLs
    slug = slug.replace(/[^\w\s-]/g, "");
  }

  // Substitui espaços e underscores pelo separador
  slug = slug.replace(/[\s_]+/g, separator as string);

  // Remove separadores duplicados
  const separatorRegex = new RegExp(`\\${separator}+`, "g");
  slug = slug.replace(separatorRegex, separator as string);

  // Remove separadores no início e fim
  const trimRegex = new RegExp(`^\\${separator}+|\\${separator}+$`, "g");
  slug = slug.replace(trimRegex, "");

  // Limita o comprimento se especificado
  if (maxLength && slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Remove separador no final se cortou no meio
    slug = slug.replace(new RegExp(`\\${separator}+$`), "");
  }

  return slug;
}
