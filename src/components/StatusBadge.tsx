"use client";

import { ProjectStatus } from "@/generated/prisma/enums";
import { useTranslations } from "next-intl";

import { Badge } from "./ui/badge";
import {
  allStages,
  translateStageConfig,
} from "@/mappers/projectStageMapper";
import { cn } from "@/utils/twMerge";

interface IStatusBadge {
  status: ProjectStatus;
}

export function StatusBadge({ status }: IStatusBadge) {
  const tStages = useTranslations("projects.stages");
  const stage = allStages.find((item) => item.key === status);
  const translated = stage
    ? translateStageConfig(stage, (key) => tStages(key as Parameters<typeof tStages>[0]))
    : null;

  return (
    <Badge
      className={cn(
        translated?.color,
        "flex items-center justify-center gap-1.5 flex-nowrap whitespace-nowrap w-fit px-2.5",
      )}
    >
      {translated?.icon && (
        <translated.icon className="h-3.5 w-3.5 text-white shrink-0" />
      )}
      <span className="leading-none text-[11px] font-semibold">
        {translated?.shortLabel ?? status}
      </span>
    </Badge>
  );
}
