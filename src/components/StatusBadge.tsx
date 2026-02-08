import { ProjectStatus } from "@/generated/prisma/enums";
import { Badge } from "./ui/badge";
import { allStages } from "@/mappers/projectStageMapper";
import { cn } from "@/lib/utils";

interface IStatusBadge {
  status: ProjectStatus;
}

export function StatusBadge({ status }: IStatusBadge) {
  const stage = allStages.find((stage) => stage.key === status);

  return (
    <Badge
      // whitespace-nowrap impede que o texto "Em Andamento" quebre em duas linhas
      // w-fit garante que o badge não estique além do necessário
      className={cn(
        stage?.color,
        "flex items-center justify-center gap-1.5 flex-nowrap whitespace-nowrap w-fit px-2.5",
      )}
    >
      {stage?.icon && (
        <stage.icon className="h-3.5 w-3.5 text-white shrink-0" />
      )}
      <span className="leading-none text-[11px] font-semibold">
        {stage?.shortLabel}
      </span>
    </Badge>
  );
}
