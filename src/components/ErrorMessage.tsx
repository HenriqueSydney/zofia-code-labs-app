import { TriangleAlertIcon } from "lucide-react";

interface IErrorMessage {
  errorMessage?: string | null;
}

export function ErrorMessage({ errorMessage = null }: IErrorMessage) {
  if (!errorMessage) return;

  return (
    <div className="flex gap-2 text-sm items-center text-destructive">
      <TriangleAlertIcon className="w-5 h-5" />
      <span>{errorMessage}</span>
    </div>
  );
}
