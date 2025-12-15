export type PasswordStrength =
  | "Muito fraca"
  | "Fraca"
  | "Média"
  | "Forte"
  | "Excelente";

interface PasswordCheck {
  score: number; // 0 a 5
  label: PasswordStrength;
  errors: string[];
}

export function checkPasswordStrength(password: string): PasswordCheck {
  const errors: string[] = [];
  let score = 0;

  // 1) Comprimento
  if (password.length >= 8) score++;
  else errors.push("Mínimo 8 caracteres");

  // 2) Tipos de caracteres
  let hasUpper = false;
  let hasLower = false;
  let hasNumber = false;
  let hasSpecial = false;

  for (const c of password) {
    if (c >= "A" && c <= "Z") hasUpper = true;
    else if (c >= "a" && c <= "z") hasLower = true;
    else if (c >= "0" && c <= "9") hasNumber = true;
    else hasSpecial = true;
  }

  if (hasUpper) score++;
  else errors.push("Falta letra maiúscula");

  if (hasLower) score++;
  else errors.push("Falta letra minúscula");

  if (hasNumber) score++;
  else errors.push("Falta número");

  if (hasSpecial) score++;
  else errors.push("Falta caractere especial");

  // 3) Bloquear sequências (abc, cba, 123, 321)
  function isSequential(str: string): boolean {
    for (let i = 0; i < str.length - 2; i++) {
      const a = str.charCodeAt(i);
      const b = str.charCodeAt(i + 1);
      const c = str.charCodeAt(i + 2);

      const asc = b === a + 1 && c === b + 1;
      const desc = b === a - 1 && c === b - 1;

      if (asc || desc) return true;
    }
    return false;
  }

  if (isSequential(password.toLowerCase())) {
    errors.push("Contém sequência óbvia (ex: abc, cba, 123)");
    score = Math.max(0, score - 1);
  }

  // 4) Repetições (aaa, 111)
  function hasRepeating(str: string): boolean {
    for (let i = 0; i < str.length - 2; i++) {
      if (str[i] === str[i + 1] && str[i] === str[i + 2]) return true;
    }
    return false;
  }

  if (hasRepeating(password)) {
    errors.push("Contém caracteres repetidos como aaa ou 111");
    score = Math.max(0, score - 1);
  }

  // 5) Mapa de força
  let label: PasswordStrength;

  if (score <= 1) label = "Muito fraca";
  else if (score === 2) label = "Fraca";
  else if (score === 3) label = "Média";
  else if (score === 4) label = "Forte";
  else label = "Excelente";

  return { score, label, errors };
}
