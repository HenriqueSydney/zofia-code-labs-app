import { ExpenseNature } from "@/generated/prisma/client";
import {
  Building2,
  Target,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";

export interface ExpenseNatureDetails {
  labelKey: keyof typeof expenseNatureLabelKeys;
  color: string;
  badge: string;
  icon: LucideIcon;
}

const expenseNatureLabelKeys = {
  OPERATIONAL: "operational",
  DIRECT_PROJECT: "directProject",
  INVESTMENT: "investment",
  PERSONAL: "personal",
} as const;

export const expenseNatureMapper: Record<ExpenseNature, ExpenseNatureDetails> =
  {
    OPERATIONAL: {
      labelKey: "OPERATIONAL",
      color: "",
      badge: "bg-accent/70 border-accent/70",
      icon: Building2,
    },
    DIRECT_PROJECT: {
      labelKey: "DIRECT_PROJECT",
      color: "",
      badge: "bg-primary/70 border-primary/70",
      icon: Target,
    },
    INVESTMENT: {
      labelKey: "INVESTMENT",
      color: "",
      badge: "bg-green-700/70 border-green-700/70",
      icon: TrendingUp,
    },
    PERSONAL: {
      labelKey: "PERSONAL",
      color: "",
      badge: "bg-gray-900/70border-gray-900/70",
      icon: User,
    },
  } as const;

type ExpenseNatureTranslator = (
  key: (typeof expenseNatureLabelKeys)[ExpenseNature],
) => string;

export function getExpenseNatureLabel(
  nature: ExpenseNature,
  t: ExpenseNatureTranslator,
): string {
  return t(expenseNatureLabelKeys[nature]);
}

export function getExpenseNatureOptions(t: ExpenseNatureTranslator) {
  return (
    Object.entries(expenseNatureMapper) as [
      ExpenseNature,
      ExpenseNatureDetails,
    ][]
  ).map(([value, details]) => ({
    value,
    label: getExpenseNatureLabel(value, t),
    icon: details.icon,
  }));
}
