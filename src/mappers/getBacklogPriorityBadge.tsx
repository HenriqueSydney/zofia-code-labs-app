import { Badge } from "@/components/ui/badge";
import { BacklogPriority } from "@/generated/prisma/enums";
import { backlogPriorityMapper } from "./BacklogMappers";

export const getBacklogPriorityBadge = (priority: BacklogPriority) => {
  const variants: Record<
    BacklogPriority,
    "destructive" | "default" | "secondary"
  > = {
    URGENT: "destructive",
    HIGH: "destructive",
    MEDIUM: "default",
    LOW: "secondary",
  };

  return (
    <Badge variant={variants[priority]}>
      {backlogPriorityMapper[priority]}
    </Badge>
  );
};
