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
} from "lucide-react";

export type ProjectStage = ProjectStatus;

export interface StageConfig {
  key: ProjectStage;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  description: string;
  nextAction?: string;
}

// Commercial Flow: Before development
export const commercialStages: StageConfig[] = [
  {
    key: "DRAFT",
    label: "Rascunho",
    shortLabel: "Rascunho",
    icon: FileText,
    color: "bg-slate-500",
    description: "Projeto em elaboração inicial",
    nextAction: "Enviar para Análise",
  },
  {
    key: "TECH_ANALYSIS",
    label: "Análise de Viabilidade",
    shortLabel: "Viabilidade",
    icon: Search,
    color: "bg-blue-500",
    description: "Avaliando viabilidade técnica e comercial",
    nextAction: "Elaborar Proposta",
  },
  {
    key: "PROPOSAL",
    label: "Proposta Comercial",
    shortLabel: "Proposta",
    icon: FileSignature,
    color: "bg-indigo-500",
    description: "Analisando proposta comercial",
    nextAction: "Preparar Contrato",
  },
  {
    key: "PROPOSAL_GENERATED",
    label: "Preparação do Contrato",
    shortLabel: "Contrato",
    icon: ClipboardCheck,
    color: "bg-purple-500",
    description: "Cliente analisando proposta",
    nextAction: "Encaminhar Contrato para Assinatura",
  },
  {
    key: "WAITING_SIGNATURE",
    label: "Assinatura do Contrato",
    shortLabel: "Assinatura",
    icon: PenTool,
    color: "bg-violet-500",
    description: "Aguardando assinatura do contrato",
    nextAction: "Aguardar Pagamento",
  },
  {
    key: "WAITING_DOWN_PAYMENT",
    label: "Aguardando Pagamento",
    shortLabel: "Pag. Entrada",
    icon: CreditCard,
    color: "bg-amber-500",
    description: "Aguardando pagamento da entrada",
    nextAction: "Iniciar Projeto",
  },
];

// Operational Flow: Development stages
export const operationalStages: StageConfig[] = [
  {
    key: "PLANNED",
    label: "Planejamento",
    shortLabel: "Planejamento",
    icon: Calendar,
    color: "bg-cyan-500",
    description: "Projeto em planejamento em preparação para início",
    nextAction: "Iniciar Desenvolvimento",
  },
  {
    key: "IN_PROGRESS",
    label: "Em Andamento",
    shortLabel: "Em Andamento",
    icon: Play,
    color: "bg-green-500",
    description: "Desenvolvimento em progresso",
    nextAction: "Enviar para Avaliação",
  },
  {
    key: "REVIEW",
    label: "Em Avaliação",
    shortLabel: "Em Avaliação",
    icon: Eye,
    color: "bg-orange-500",
    description: "Cliente avaliando entregas",
    nextAction: "Entregar Produto",
  },
];

// Commercial Flow: After development
export const commercialClosingStages: StageConfig[] = [
  {
    key: "DELIVERED",
    label: "Produto Entregue",
    shortLabel: "Entregue",
    icon: Package,
    color: "bg-emerald-500",
    description: "Produto entregue ao cliente",
    nextAction: "Solicitar Pagamento Final",
  },
  {
    key: "FINAL_PAYMENT",
    label: "Pagamento Final",
    shortLabel: "Pagamento Final",
    icon: Banknote,
    color: "bg-amber-600",
    description: "Aguardando pagamento final",
    nextAction: "Concluir Projeto",
  },
  {
    key: "COMPLETED",
    label: "Concluído",
    shortLabel: "Concluído",
    icon: CheckCircle2,
    color: "bg-primary",
    description: "Projeto concluído com sucesso",
    nextAction: "Iniciar Manutenção",
  },
];

// Post-project
export const postProjectStage: StageConfig = {
  key: "MAINTENANCE",
  label: "Manutenção & Suporte",
  shortLabel: "Suporte",
  icon: Wrench,
  color: "bg-teal-500",
  description: "Em período de manutenção e suporte contínuo",
};

export const cancelledStage: StageConfig = {
  key: "CANCELLED",
  label: "Cancelado",
  shortLabel: "Cancelado",
  icon: XCircle,
  color: "bg-destructive",
  description: "Projeto cancelado",
};

export const allStages: StageConfig[] = [
  ...commercialStages,
  ...operationalStages,
  ...commercialClosingStages,
  postProjectStage,
];
