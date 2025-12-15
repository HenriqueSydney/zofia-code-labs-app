export function mask(text: string, mask: string): string {
  let maskedValue = "";
  let maskIndex = 0;
  for (let i = 0; i < text.length; i++) {
    if (maskIndex >= mask.length) break;
    if (mask[maskIndex] === "#") {
      maskedValue += text[i];
      maskIndex++;
    } else {
      maskedValue += mask[maskIndex];
      maskIndex++;
      i--;
    }
  }
  return maskedValue;
}

export function convertPatternToIMask(pattern: string): string {
  return pattern.replace(/#/g, "0");
}

export function removeMask(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Máscaras pré-definidas comuns
 */
export const maskPatterns = {
  cnpj: "##.###.###/####-##",
  cpf: "###.###.###-##",
  telefone: "(##) ####-####",
  celular: "(##) #####-####",
  cep: "#####-###",
  data: "##/##/####",
  hora: "##:##",
  cartaoCredito: "#### #### #### ####",
} as const;

/**
 * Funções de formatação prontas
 */
export const maskFormatters = {
  cnpj: (value: string) => mask(value, maskPatterns.cnpj),
  cpf: (value: string) => mask(value, maskPatterns.cpf),
  telefone: (value: string) => mask(value, maskPatterns.telefone),
  celular: (value: string) => mask(value, maskPatterns.celular),
  cep: (value: string) => mask(value, maskPatterns.cep),
  data: (value: string) => mask(value, maskPatterns.data),

  // Telefone dinâmico (alterna entre telefone fixo e celular)
  telefoneDinamico: (value: string) => {
    const cleaned = removeMask(value);
    const pattern =
      cleaned.length <= 10 ? maskPatterns.telefone : maskPatterns.celular;
    return mask(cleaned, pattern);
  },
};
