"use client";
import { TableCell, TableRow } from "@/components/ui/table";
import { normalizeId } from "@/utils/normalizeId";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Fragment, TableHTMLAttributes, useState } from "react";
import { TableRowData } from "..";
import { cn } from "@/utils/twMerge";

interface ITableRowsProps extends TableHTMLAttributes<HTMLTableElement> {
  data: TableRowData;
}

export function TableRows({ data, className }: ITableRowsProps) {
  const [isCollapseHidden, setIsCollapseHidden] = useState(true);

  function handleToggleCollapse() {
    setIsCollapseHidden((prevState) => !prevState);
  }

  return (
    <Fragment>
      <TableRow className={className}>
        {Object.entries(data || {}).map(([key, cellData]) => {
          const isCollapseOrActions = key === "collapse" || key === "actions";

          let defaultClassName: string | undefined;
          if (isCollapseOrActions) {
            defaultClassName = "text-align-center";
          }

          return (
            <TableCell
              key={`${normalizeId(key)}-td-table`}
              className={cn(defaultClassName, cellData.className)}
            >
              {key === "collapse" && (
                <button
                  className="br-button circle small"
                  type="button"
                  aria-label="Expandir/Retrair Linha"
                  data-toggle="collapse"
                  aria-describedby={`collapse-${normalizeId(key)}`}
                  onClick={handleToggleCollapse}
                >
                  {isCollapseHidden ? (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              )}
              {key !== "collapse" && !cellData.itemClassName && cellData.value}
              {key !== "collapse" && cellData.itemClassName && (
                <div className={cellData.itemClassName}>{cellData.value}</div>
              )}
            </TableCell>
          );
        })}
      </TableRow>
      {data.collapse && (
        <TableRow className="collapse">
          <TableCell
            aria-hidden={isCollapseHidden ? "true" : "false"}
            hidden={isCollapseHidden}
            colSpan={Object.keys(data || {}).length}
          >
            {data.collapse.value}
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}
