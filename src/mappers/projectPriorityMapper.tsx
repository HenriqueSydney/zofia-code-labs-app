import { Badge } from "@/components/ui/badge";
import { Priority } from "@/generated/prisma/client";

export const PROJECT_PRIORITY_TRANSLATION_KEYS: Record<Priority, Priority> = {
  URGENT: "URGENT",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const;

export function getProjectPriorityLabel(
  priority: Priority,
  t: (key: string) => string,
): string {
  return t(PROJECT_PRIORITY_TRANSLATION_KEYS[priority]);
}

export function getPriorityOptions(t: (key: string) => string) {
  return (Object.keys(PROJECT_PRIORITY_TRANSLATION_KEYS) as Priority[]).map(
    (value) => ({
      label: getProjectPriorityLabel(value, t),
      value,
    }),
  );
}

type PriorityMapperType = {
  label: string;
  variant: "secondary" | "outline" | "destructive" | "default";
};

export const getProjectPriorityBadge = (
  priority: Priority,
  t: (key: string) => string,
) => {
  const label = getProjectPriorityLabel(priority, t);

  const config: Record<Priority, PriorityMapperType> = {
    URGENT: { label, variant: "destructive" },
    HIGH: { label, variant: "default" },
    MEDIUM: { label, variant: "secondary" },
    LOW: { label, variant: "outline" },
  };

  return (
    <Badge variant={config[priority]?.variant ?? "outline"}>
      {config[priority]?.label ?? getProjectPriorityLabel("LOW", t)}
    </Badge>
  );
};
