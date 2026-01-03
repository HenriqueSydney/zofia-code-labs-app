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
      className={cn(stage?.color, "flex items-center justify-between gap-1")}
    >
      {stage?.icon && <stage.icon className="h-3 w-3 text-white" />}
      {stage?.shortLabel}
    </Badge>
  );
}
