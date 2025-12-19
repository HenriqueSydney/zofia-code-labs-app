export async function getParams<T extends Record<string, any>>(
  paramsPromise: Promise<any> | any,
  keys: (keyof T)[]
): Promise<T> {
  // Resolve a Promise se ela existir, senão usa um objeto vazio
  const resolvedParams = await (paramsPromise ?? {});

  // Inicializamos o objeto com o tipo correto para evitar erro de indexação
  const result = {} as T;

  keys.forEach((key) => {
    const value = resolvedParams[key as string];

    if (value === undefined || value === null) {
      result[key] = undefined as any;
    } else if (Array.isArray(value)) {
      // Se for array, transforma em string separada por vírgula (padrão query params)
      result[key] = value.join(",") as any;
    } else {
      // Converte para string para garantir consistência, ou mantém o tipo se preferir
      result[key] = String(value) as any;
    }
  });

  return result;
}
