import { BacklogPriority, BacklogStatus } from "@/generated/prisma/enums";

export const BACKLOG_PRIORITY_TRANSLATION_KEYS: Record<BacklogPriority, string> =
  {
    URGENT: "URGENT",
    HIGH: "HIGH",
    MEDIUM: "MEDIUM",
    LOW: "LOW",
  } as const;

export const BACKLOG_STATUS_TRANSLATION_KEYS: Record<BacklogStatus, string> = {
  TODO: "todo",
  IN_PROGRESS: "inProgress",
  REVIEW: "review",
  DONE: "done",
  CANCELED: "canceled",
  WAITING_CLIENT: "waitingClient",
} as const;

export function getBacklogPriorityLabel(
  priority: BacklogPriority,
  t: (key: string) => string,
): string {
  return t(BACKLOG_PRIORITY_TRANSLATION_KEYS[priority]);
}

export function getBacklogStatusLabel(
  status: BacklogStatus,
  t: (key: string) => string,
): string {
  return t(BACKLOG_STATUS_TRANSLATION_KEYS[status]);
}

export function getBacklogPriorityOptions(t: (key: string) => string) {
  return (Object.keys(BACKLOG_PRIORITY_TRANSLATION_KEYS) as BacklogPriority[]).map(
    (value) => ({
      value,
      label: getBacklogPriorityLabel(value, t),
    }),
  );
}

export function getBacklogStatusOptions(t: (key: string) => string) {
  return (Object.keys(BACKLOG_STATUS_TRANSLATION_KEYS) as BacklogStatus[]).map(
    (value) => ({
      value,
      label: getBacklogStatusLabel(value, t),
    }),
  );
}

export const backlogStatusArray = Object.keys(
  BACKLOG_STATUS_TRANSLATION_KEYS,
) as [BacklogStatus, ...BacklogStatus[]];

export const backlogPriorityArray = Object.keys(
  BACKLOG_PRIORITY_TRANSLATION_KEYS,
) as [BacklogPriority, ...BacklogPriority[]];
