import { toast } from "sonner";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";

// Define o formato de erro padrão que vem do Server Action (String ou Zod Flattened)
type ActionError =
  | string
  | Record<string, string[] | undefined>
  | null
  | undefined;

export function handleActionError<T extends FieldValues>(
  error: ActionError,
  setError: UseFormSetError<T>
) {
  if (!error) return;

  // CASO 1: Erro genérico (ex: "Usuário não autorizado")
  if (typeof error === "string") {
    toast.error(error);
    return;
  }

  // CASO 2: Erros de validação de campos (Zod)
  let hasFieldErrors = false;

  Object.entries(error).forEach(([field, messages]) => {
    // Garante que existe mensagem antes de tentar setar
    if (messages && messages.length > 0) {
      setError(field as Path<T>, {
        type: "manual",
        message: messages[0],
      });
      hasFieldErrors = true;
    }
  });

  if (hasFieldErrors) {
    toast.error("Verifique os campos destacados no formulário.");
  } else {
    // Fallback caso venha um objeto de erro vazio ou desconhecido
    toast.error("Ocorreu um erro ao processar a solicitação.");
  }
}
