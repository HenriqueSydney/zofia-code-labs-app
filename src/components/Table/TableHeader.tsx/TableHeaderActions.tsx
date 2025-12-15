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
            title="Ver mais opções"
            aria-label="Definir densidade da tabela"
          >
            <EllipsisVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleDensitySelection("small")}>
            Densidade alta
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleDensitySelection("medium")}>
            Densidade média
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleDensitySelection("large")}>
            Densidade baixa
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
