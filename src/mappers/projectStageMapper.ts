import { ProjectStatus } from "@/generated/prisma/enums";
import {
  FileText,
  Search,
  FileSignature,
  ClipboardCheck,
  PenTool,
  CreditCard,
  Calendar,
  Play,
  Eye,
  Package,
  Wrench,
  XCircle,
  CheckCircle2,
  Banknote,
  PauseCircle,
} from "lucide-react";

export type ProjectStage = ProjectStatus;

export interface StageConfig {
  key: ProjectStage;
  icon: React.ElementType;
  color: string;
}

export type StageTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export interface TranslatedStageConfig extends StageConfig {
  label: string;
  shortLabel: string;
  description: string;
  nextAction?: string;
}

export function translateStageConfig(
  stage: StageConfig,
  t: StageTranslator,
): TranslatedStageConfig {
  const key = stage.key;

  return {
    ...stage,
    label: t(`${key}.label`),
    shortLabel: t(`${key}.shortLabel`),
    description: t(`${key}.description`),
    nextAction: STAGES_WITH_NEXT_ACTION.has(key)
      ? t(`${key}.nextAction`)
      : undefined,
  };
}

const STAGES_WITH_NEXT_ACTION = new Set<ProjectStage>([
  "DRAFT",
  "TECH_ANALYSIS",
  "PROPOSAL",
  "PROPOSAL_GENERATED",
  "WAITING_SIGNATURE",
  "WAITING_DOWN_PAYMENT",
  "PLANNED",
  "IN_PROGRESS",
  "REVIEW",
  "DELIVERED",
  "FINAL_PAYMENT",
  "COMPLETED",
]);

export function translateStageConfigs(
  stages: StageConfig[],
  t: StageTranslator,
): TranslatedStageConfig[] {
  return stages.map((stage) => translateStageConfig(stage, t));
}

export function findTranslatedStage(
  status: ProjectStage,
  t: StageTranslator,
): TranslatedStageConfig | undefined {
  const stage = allStages.find((s) => s.key === status);
  return stage ? translateStageConfig(stage, t) : undefined;
}

// Commercial Flow: Before development
export const commercialStages: StageConfig[] = [
  { key: "DRAFT", icon: FileText, color: "bg-slate-500" },
  { key: "TECH_ANALYSIS", icon: Search, color: "bg-blue-500" },
  { key: "PROPOSAL", icon: FileSignature, color: "bg-indigo-500" },
  { key: "PROPOSAL_GENERATED", icon: ClipboardCheck, color: "bg-purple-500" },
  { key: "WAITING_SIGNATURE", icon: PenTool, color: "bg-violet-500" },
  { key: "WAITING_DOWN_PAYMENT", icon: CreditCard, color: "bg-amber-500" },
];

export const operationalStages: StageConfig[] = [
  { key: "PLANNED", icon: Calendar, color: "bg-cyan-500" },
  { key: "IN_PROGRESS", icon: Play, color: "bg-green-500" },
  { key: "REVIEW", icon: Eye, color: "bg-orange-500" },
];

export const commercialClosingStages: StageConfig[] = [
  { key: "DELIVERED", icon: Package, color: "bg-emerald-500" },
  { key: "FINAL_PAYMENT", icon: Banknote, color: "bg-amber-600" },
  { key: "COMPLETED", icon: CheckCircle2, color: "bg-primary" },
];

export const postProjectStage: StageConfig = {
  key: "MAINTENANCE",
  icon: Wrench,
  color: "bg-teal-500",
};

export const onHoldStage: StageConfig = {
  key: "ON_HOLD",
  icon: PauseCircle,
  color: "bg-yellow-500",
};

export const cancelledStage: StageConfig = {
  key: "CANCELLED",
  icon: XCircle,
  color: "bg-destructive",
};

export const allStages: StageConfig[] = [
  ...commercialStages,
  ...operationalStages,
  ...commercialClosingStages,
  postProjectStage,
  onHoldStage,
  cancelledStage,
];

/** Agrupa status do Prisma em categorias do gráfico de pipeline. */
export const PIPELINE_CATEGORY_BY_STATUS: Record<
  ProjectStage,
  "inProgress" | "completed" | "negotiation" | "paused" | "notStarted"
> = {
  DRAFT: "notStarted",
  TECH_ANALYSIS: "negotiation",
  PROPOSAL: "negotiation",
  PROPOSAL_GENERATED: "negotiation",
  WAITING_SIGNATURE: "negotiation",
  WAITING_DOWN_PAYMENT: "negotiation",
  PLANNED: "notStarted",
  IN_PROGRESS: "inProgress",
  REVIEW: "inProgress",
  DELIVERED: "inProgress",
  FINAL_PAYMENT: "inProgress",
  COMPLETED: "completed",
  MAINTENANCE: "completed",
  CANCELLED: "paused",
  ON_HOLD: "paused",
};
