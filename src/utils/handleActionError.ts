import { toast } from "sonner";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";

type ActionError =
  | string
  | Record<string, string[] | undefined>
  | null
  | undefined;

type HandleActionErrorMessages = {
  checkFormFields: string;
  processRequest: string;
};

export function handleActionError<T extends FieldValues>(
  error: ActionError,
  setError: UseFormSetError<T>,
  messages: HandleActionErrorMessages,
) {
  if (!error) return;

  if (typeof error === "string") {
    toast.error(error);
    return;
  }

  let hasFieldErrors = false;

  Object.entries(error).forEach(([field, fieldMessages]) => {
    if (fieldMessages && fieldMessages.length > 0) {
      setError(field as Path<T>, {
        type: "manual",
        message: fieldMessages[0],
      });
      hasFieldErrors = true;
    }
  });

  if (hasFieldErrors) {
    toast.error(messages.checkFormFields);
  } else {
    toast.error(messages.processRequest);
  }
}
