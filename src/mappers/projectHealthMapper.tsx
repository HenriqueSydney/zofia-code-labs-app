import { Badge } from "@/components/ui/badge";
import { ProjectHealth } from "@/generated/prisma/client";

export const PROJECT_HEALTH_TRANSLATION_KEYS: Record<
  ProjectHealth,
  "HEALTHY" | "AT_RISK" | "DELAYED"
> = {
  ON_TRACK: "HEALTHY",
  AT_RISK: "AT_RISK",
  OFF_TRACK: "DELAYED",
} as const;

export function getProjectHealthLabel(
  health: ProjectHealth,
  t: (key: string) => string,
): string {
  const key = PROJECT_HEALTH_TRANSLATION_KEYS[health];
  return t(`health.${key}`);
}

export const projectHealthOptions = (
  t: (key: string) => string,
) =>
  (Object.keys(PROJECT_HEALTH_TRANSLATION_KEYS) as ProjectHealth[]).map(
    (value) => ({
      label: getProjectHealthLabel(value, t),
      value,
    }),
  );

type ProjectHealthMapperType = {
  label: string;
  className: string;
  variant: "secondary" | "outline" | "destructive" | "default";
};

export const getProjectHealthBadge = (
  projectHealth: ProjectHealth,
  t: (key: string) => string,
) => {
  const label = getProjectHealthLabel(projectHealth, t);

  const config: Record<ProjectHealth, ProjectHealthMapperType> = {
    ON_TRACK: {
      label,
      variant: "default",
      className: "bg-emerald-500 hover:bg-emerald-600 text-white border-none",
    },
    AT_RISK: {
      label,
      variant: "outline",
      className:
        "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
    },
    OFF_TRACK: {
      label,
      variant: "destructive",
      className: "",
    },
  };

  const current = config[projectHealth];

  return (
    <Badge
      variant={current?.variant ?? "outline"}
      className={current?.className}
    >
      {current?.label ?? getProjectHealthLabel("ON_TRACK", t)}
    </Badge>
  );
};
