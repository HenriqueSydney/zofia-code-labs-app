import { BacklogStatus } from "@/generated/prisma/enums";
import { backlogStatusMapper } from "./BacklogMappers";

export const getBacklogStatusBadge = (status: BacklogStatus) => {
  const colors: Record<BacklogStatus, string> = {
    TODO: "bg-muted text-muted-foreground",
    IN_PROGRESS: "bg-accent/20 text-accent",
    REVIEW: "bg-primary/20 text-primary",
    DONE: "bg-green-500/20 text-green-600",
    CANCELED: "bg-red-500/20 text-red-600",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}
    >
      {backlogStatusMapper[status]}
    </span>
  );
};
