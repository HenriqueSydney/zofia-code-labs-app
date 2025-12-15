"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { CheckBoxPerLineConfig, TableColumn, TableRowData } from "..";

import {
  Table as ShadcnTable,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
} from "@/components/ui/table";
import { TableRows } from "./TableRows";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { normalizeId } from "@/utils/normalizeId";
import { cn } from "@/utils/twMerge";

interface IMainTableProps {
  caption?: string;
  tableColumns: TableColumn[];
  data: TableRowData[];
  checkBoxPerLine?: CheckBoxPerLineConfig;
  selectedItems: string[];
  handleToggleAllSelection?: () => void;
  handleToggleItemSelection?: (itemId: string) => void;
}
export function MainTable({
  caption,
  data,
  tableColumns,
  checkBoxPerLine,
  selectedItems,
  handleToggleAllSelection,
  handleToggleItemSelection,
}: IMainTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  if (data.length === 0) {
    return null;
  }

  let classNameForInput = "indeterminate";
  if (selectedItems.length === data.length) {
    classNameForInput = "check-box-full";
  } else if (selectedItems.length === 0) {
    classNameForInput = "";
  }

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("desc");
    }
  };

  const sortedData = sortColumn
    ? [...data].sort((a, b) => {
        const aData = a[sortColumn as keyof typeof a];
        const bData = b[sortColumn as keyof typeof b];

        const aVal =
          typeof aData === "object" && aData !== null
            ? aData.sortValue ?? aData.value
            : aData;
        const bVal =
          typeof bData === "object" && bData !== null
            ? bData.sortValue ?? bData.value
            : bData;

        const getComparableValue = (val: any): string | number => {
          if (sortColumn === "date") {
            if (val instanceof Date || typeof val === "string") {
              return new Date(val).getTime();
            }
          }

          if (typeof val === "string") {
            const numVal = parseFloat(val.replace(/\./g, "").replace(",", "."));
            if (!isNaN(numVal)) {
              return numVal;
            }
          }

          return val;
        };

        const comparableA = getComparableValue(aVal);
        const comparableB = getComparableValue(bVal);

        if (sortDirection === "asc") {
          return comparableA > comparableB ? 1 : -1;
        } else {
          return comparableA < comparableB ? 1 : -1;
        }
      })
    : data;

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 ml-2 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-2" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-2" />
    );
  };

  return (
    <div className="responsive">
      <ShadcnTable>
        {caption && <caption>{caption}</caption>}
        <TableHeader>
          <TableRow>
            {checkBoxPerLine && (
              <TableHead className="w-2 align-center">
                <div className="br-checkbox hidden-label">
                  <input
                    className={classNameForInput}
                    id="check-all-98928"
                    type="checkbox"
                    aria-label="Selecionar tudo"
                    checked={selectedItems.length === data.length}
                    onChange={handleToggleAllSelection}
                  />
                  <label htmlFor="check-all-98928">
                    Selecionar todas as linhas
                  </label>
                </div>
              </TableHead>
            )}
            {tableColumns.map((column) => {
              const isCollapseOrActions =
                column.key === "collapse" || column.key === "actions";
              let defaultClassName: string | undefined;
              if (isCollapseOrActions) {
                defaultClassName = "text-align-center";
              }

              const isSortable = column.sortable && !isCollapseOrActions;

              return (
                <TableHead
                  key={`${normalizeId(column.key)}-th-table`}
                  scope="col"
                  className={cn(
                    column.className,
                    defaultClassName,
                    isSortable &&
                      "cursor-pointer hover:text-purple-400 transition-colors"
                  )}
                  onClick={
                    isSortable ? () => handleSort(column.key) : undefined
                  }
                >
                  {isCollapseOrActions ? (
                    ""
                  ) : (
                    <div className="flex items-center justify-start gap-2">
                      {column.icon && column.icon}
                      {column.label}
                      {isSortable && getSortIcon(column.key)}
                    </div>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => {
            let rowData: TableRowData = { ...item };

            if (
              checkBoxPerLine &&
              item[checkBoxPerLine.label] &&
              handleToggleItemSelection
            ) {
              const cellData = item[checkBoxPerLine.label];
              const value = String(cellData.value);

              rowData = {
                checked: {
                  value: (
                    <div className="br-checkbox hidden-label">
                      <input
                        id={`checkbox-${value}`}
                        type="checkbox"
                        value={value}
                        checked={selectedItems.includes(value)}
                        aria-label={`Selecionar linha ${checkBoxPerLine.label}`}
                        onChange={() =>
                          handleToggleItemSelection(value.toString())
                        }
                      />
                      <label htmlFor={`checkbox-${value}`}>
                        Selecionar {checkBoxPerLine.label}
                      </label>
                    </div>
                  ),
                },
                ...item,
              };

              return (
                <TableRows
                  className={selectedItems.includes(value) ? "is-selected" : ""}
                  key={`${index}-tr-table`}
                  data={rowData}
                />
              );
            }

            return <TableRows key={`${index}-tr-table`} data={rowData} />;
          })}
        </TableBody>
      </ShadcnTable>
    </div>
  );
}
