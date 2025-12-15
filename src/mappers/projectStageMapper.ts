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

interface StageConfig {
  key: ProjectStage;
  label: string;
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
    icon: FileText,
    color: "bg-slate-500",
    description: "Projeto em elaboração inicial",
    nextAction: "Enviar para Análise",
  },
  {
    key: "TECH_ANALYSIS",
    label: "Análise de Viabilidade",
    icon: Search,
    color: "bg-blue-500",
    description: "Avaliando viabilidade técnica e comercial",
    nextAction: "Elaborar Proposta",
  },
  {
    key: "PROPOSAL",
    label: "Elaboração da Proposta",
    icon: FileSignature,
    color: "bg-indigo-500",
    description: "Preparando proposta comercial",
    nextAction: "Enviar para Cliente",
  },
  {
    key: "PROPOSAL_GENERATED",
    label: "Análise de Proposta",
    icon: ClipboardCheck,
    color: "bg-purple-500",
    description: "Cliente analisando proposta",
    nextAction: "Aguardar Contrato",
  },
  {
    key: "WAITING_SIGNATURE",
    label: "Aguardando Contrato",
    icon: PenTool,
    color: "bg-violet-500",
    description: "Aguardando assinatura do contrato",
    nextAction: "Aguardar Pagamento",
  },
  {
    key: "WAITING_DOWN_PAYMENT",
    label: "Aguardando Pagamento",
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
    label: "Planejado",
    icon: Calendar,
    color: "bg-cyan-500",
    description: "Projeto planejado, pronto para iniciar",
    nextAction: "Iniciar Desenvolvimento",
  },
  {
    key: "IN_PROGRESS",
    label: "Em Andamento",
    icon: Play,
    color: "bg-green-500",
    description: "Desenvolvimento em progresso",
    nextAction: "Enviar para Avaliação",
  },
  {
    key: "REVIEW",
    label: "Em Avaliação",
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
    icon: Package,
    color: "bg-emerald-500",
    description: "Produto entregue ao cliente",
    nextAction: "Solicitar Pagamento Final",
  },
  {
    key: "FINAL_PAYMENT",
    label: "Pagamento Final",
    icon: Banknote,
    color: "bg-amber-600",
    description: "Aguardando pagamento final",
    nextAction: "Concluir Projeto",
  },
  {
    key: "COMPLETED",
    label: "Concluído",
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
  icon: Wrench,
  color: "bg-teal-500",
  description: "Em período de manutenção e suporte contínuo",
};

export const cancelledStage: StageConfig = {
  key: "CANCELLED",
  label: "Cancelado",
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
