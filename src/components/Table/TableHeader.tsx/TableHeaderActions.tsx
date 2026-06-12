"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { Fragment } from "react";
import { useTranslations } from "next-intl";

export type HeaderActions = {
  action: () => void;
  label: string;
};

interface ITableHeaderActions {
  headerActions?: HeaderActions[];
  tableId?: string;
}

export function TableHeaderActions({
  headerActions,
  tableId = "",
}: ITableHeaderActions) {
  const t = useTranslations("common.table");
  function handleDensitySelection(type: "small" | "medium" | "large"): void {
    const table = document.querySelector(`.br-table#${tableId}`);
    table?.classList.remove("small", "medium", "large");
    table?.classList.add(type);
  }

  return (
    <div className="text-nowrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-full"
            variant="outline"
            type="button"
            title={t("moreOptions")}
            aria-label={t("densityLabel")}
          >
            <EllipsisVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleDensitySelection("small")}>
            {t("densityHigh")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleDensitySelection("medium")}>
            {t("densityMedium")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleDensitySelection("large")}>
            {t("densityLow")}
          </DropdownMenuItem>
          {headerActions &&
            headerActions.map(({ action, label }) => (
              <Fragment key={label}>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={action}>{label}</DropdownMenuItem>
              </Fragment>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
