import { handleErrors } from "@/errors/handleErrors";
import {
  resolveErrorMessage,
  resolveSuccessMessage,
} from "@/lib/i18n/resolveErrorMessage";

/** Registra o erro e devolve a mensagem traduzida para o frontend. */
export async function resolveActionErrorMessage(error: unknown): Promise<string> {
  handleErrors(error);
  return resolveErrorMessage(error);
}

/** Mensagem traduzida por chave em `errors.server`. */
export async function serverErrorMessage(
  key: string,
  params?: Record<string, string | number>,
): Promise<string> {
  return resolveErrorMessage(key, params);
}

export { resolveSuccessMessage };
