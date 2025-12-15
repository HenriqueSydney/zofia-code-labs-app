import { Badge } from "./ui/badge";

interface IStatusBadge {
  status: "completed" | "inProgress" | "planning";
}

export function StatusBadge({ status }: IStatusBadge) {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    completed: "default",
    inProgress: "secondary",
    planning: "outline",
  };
  const labels: Record<string, string> = {
    completed: "Concluído",
    inProgress: "Em Andamento",
    planning: "Planejamento",
  };
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
