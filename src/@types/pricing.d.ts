import { LucideIcon } from "lucide-react";

export type AccessLevel = "erp_only" | "full_access" | "api_integration";

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  icon: LucideIcon; // Adicionado para o componente
  description: string;
  isIndicated: boolean;
  price: {
    monthly: number | null;
    yearly: number | null;
  };
  features: PricingFeature[]; // Transformado em objeto para lógica de 'check'
  dataPoints: string[]; // Importante para o diferencial do Analytics/Metrics
  highlighted: boolean;
  ctaVariant: "default" | "outline" | "secondary" | "ghost"; // Para o ShadcnUI
  buttonText: string;
  metadata: {
    maxWebsites?: number;
    maxProjects?: number;
    accessLevel: AccessLevel;
    retentionMonths: number;
  };
}

export interface PricingPlanDTO extends Omit<PricingPlan, "icon"> {
  icon: string; // O que o JSON entrega
}
