"use client";

import { Search } from "lucide-react";
import { HeaderActions } from "./TableHeaderActions";
import { useState } from "react";
import { TableSearchBar } from "./TableSearchBar";
import { TableHeaderItensSelection } from "./TableHeaderItensSelection";
import { CheckBoxActionSubmit, CheckBoxPerLineConfig } from "..";
import { Button } from "@/components/ui/button";

interface ITableHeaderProps {
  tableId?: string;
  caption?: string;
  headerActions?: HeaderActions[];
  showSearchBar?: boolean;
  checkBoxPerLine?: CheckBoxPerLineConfig;
  selectedItems?: string[];
  handleAction?: (data: CheckBoxActionSubmit) => Promise<void>;
}

export function TableHeader({
  tableId = "",
  caption,
  headerActions,
  showSearchBar,
  checkBoxPerLine,
  selectedItems,
  handleAction,
}: ITableHeaderProps) {
  const [isHeaderSearchBarOpen, setIsHeaderSearchBarOpen] = useState(false);

  function handleToggleSearchBar() {
    setIsHeaderSearchBarOpen((prevState) => !prevState);
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-2">
      {caption && <h2 className="text-lg font-semibold flex-1">{caption}</h2>}
      <div className="flex items-center gap-2 ml-auto">
        {showSearchBar && !isHeaderSearchBarOpen && (
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shrink-0"
            type="button"
            aria-label="Abrir busca"
            aria-expanded={isHeaderSearchBarOpen}
            aria-controls={`table-searchbox-${tableId}`}
            onClick={handleToggleSearchBar}
          >
            <Search size={16} />
          </Button>
        )}
        {showSearchBar && (
          <div className="flex justify-end">
            <TableSearchBar
              isHeaderSearchBarOpen={isHeaderSearchBarOpen}
              handleToggleSearchBar={handleToggleSearchBar}
              tableId={tableId}
            />
          </div>
        )}
        {/* <TableHeaderActions headerActions={headerActions} tableId={tableId} /> */}
      </div>

      {checkBoxPerLine && handleAction && selectedItems && (
        <TableHeaderItensSelection
          tableId={tableId}
          checkBoxPerLine={checkBoxPerLine}
          handleAction={handleAction}
          selectedItems={selectedItems}
        />
      )}
    </div>
  );
}
