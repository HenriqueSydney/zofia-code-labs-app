import { Badge } from "@/components/ui/badge";
import { BacklogPriority } from "@/generated/prisma/enums";
import { getBacklogPriorityLabel } from "./BacklogMappers";

export const getBacklogPriorityBadge = (
  priority: BacklogPriority,
  t: (key: string) => string,
) => {
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
      {getBacklogPriorityLabel(priority, t)}
    </Badge>
  );
};
