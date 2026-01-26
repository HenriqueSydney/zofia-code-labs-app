import { Badge } from "@/components/ui/badge";
import { ProjectHealth } from "@/generated/prisma/client";

// Proposta de textos claros e profissionais
const projectHealthMapper: Record<ProjectHealth, string> = {
  ON_TRACK: "Saudável", // Verde (Saudável)
  AT_RISK: "Em Risco", // Amarelo/Laranja (Atenção)
  OFF_TRACK: "Atrasado", // Vermelho (Crítico)
} as const;

export const projectHealthOptions = Object.entries(projectHealthMapper).map(
  ([value, label]) => ({
    label,
    value,
  }),
);

type ProjectHealthMapperType = {
  label: string;
  className: string; // Usando className para ter mais controle de cores (Tailwind)
  variant: "secondary" | "outline" | "destructive" | "default";
};

export const getProjectHealthBadge = (projectHealth: ProjectHealth) => {
  const config: Record<ProjectHealth, ProjectHealthMapperType> = {
    ON_TRACK: {
      label: projectHealthMapper["ON_TRACK"],
      variant: "default",
      className: "bg-emerald-500 hover:bg-emerald-600 text-white border-none",
    },
    AT_RISK: {
      label: projectHealthMapper["AT_RISK"],
      variant: "outline",
      className:
        "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
    },
    OFF_TRACK: {
      label: projectHealthMapper["OFF_TRACK"],
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
      {current?.label ?? config["ON_TRACK"].label}
    </Badge>
  );
};
