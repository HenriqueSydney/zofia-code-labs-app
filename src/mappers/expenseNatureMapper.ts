import { ExpenseNature } from "@/generated/prisma/client";
import {
  Building2,
  Target,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";

export interface ExpenseNatureDetails {
  label: string;
  color: string;
  badge: string;
  icon: LucideIcon;
}

export const expenseNatureMapper: Record<ExpenseNature, ExpenseNatureDetails> =
  {
    OPERATIONAL: {
      label: "Operacional",
      color: "",
      badge: "bg-accent/70 border-accent/70",
      icon: Building2,
    },
    DIRECT_PROJECT: {
      label: "Direto (Projeto)",
      color: "",
      badge: "bg-primary/70 border-primary/70",
      icon: Target,
    },
    INVESTMENT: {
      label: "Investimento",
      color: "",
      badge: "bg-green-700/70 border-green-700/70",
      icon: TrendingUp,
    },
    PERSONAL: {
      label: "Pessoal/Sócio",
      color: "",
      badge: "bg-gray-900/70border-gray-900/70",
      icon: User,
    },
  } as const;

export const expenseNatureOptions = (
  Object.entries(expenseNatureMapper) as [ExpenseNature, ExpenseNatureDetails][]
).map(([value, details]) => ({
  value: value,
  label: details.label,
  icon: details.icon,
}));
