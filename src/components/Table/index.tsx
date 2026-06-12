"use client";
import React, { HTMLAttributes, useState } from "react";
import { HeaderActions } from "./TableHeader.tsx/TableHeaderActions";
import { tableFormAction } from "./tableFormAction";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Clipboard, LucideIcon, XCircle } from "lucide-react";
import { TableHeader } from "./TableHeader.tsx";
import { EmptyState } from "../EmptyState";
import { Button } from "../ui/button";
import { MainTable } from "./MainTable";
import { useTranslations } from "next-intl";

export type CheckBoxPerLineConfig = {
  label: string;
  actions: {
    label: string;
    Icon?: React.ReactNode;
    endPointActionRoute: string;
    method: "PUT" | "POST" | "DELETE" | "PATCH";
    tagsToRevalidate?: string[];
    pathsToRevalidate?: string[];
  }[];
};

export type CheckBoxActionSubmit = {
  actionEndPoint: string;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  tagsToRevalidate?: string[];
  pathsToRevalidate?: string[];
};

export type TableColumn = {
  key: string;
  label: string;
  sortable?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

type TableCellData = {
  value: string | number | React.ReactNode;
  sortValue?: string | number | Date | null;
  className?: string;
  itemClassName?: string;
};

// Tipo para uma linha da tabela
export type TableRowData = {
  [key: string]: TableCellData;
};

interface ITableProps extends HTMLAttributes<HTMLDivElement> {
  tableId: string;
  showSearchBar?: boolean;
  dataEndPoint?: string;
  checkBoxPerLine?: CheckBoxPerLineConfig;
  caption?: string;
  headerActions?: HeaderActions[];
  data: TableRowData[];
  tableColumns?: TableColumn[];
  showPagination?: boolean;
  numberPerPage?: number;
  totalOfRecords?: number;
  emptyState?: {
    title: string;
    description: string;
    icon: LucideIcon;
  };
}

export function Table({
  tableId,
  dataEndPoint = "",
  headerActions = [],
  tableColumns = [],
  caption,
  className = "",
  checkBoxPerLine,
  showSearchBar = false,
  data,
  showPagination,
  numberPerPage,
  totalOfRecords,
  emptyState,
  ...rest
}: ITableProps) {
  const t = useTranslations("components.table");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  function handleToggleAllSelection() {
    if (selectedItems.length === data.length) {
      setSelectedItems([]);
      return;
    }

    if (checkBoxPerLine && selectedItems.length === 0) {
      setSelectedItems(data.map((item) => String(item[checkBoxPerLine.label])));
    }

    if (checkBoxPerLine) {
      const newSelectedItems = data
        .map((item) => String(item[checkBoxPerLine.label]))
        .filter((item) => !selectedItems.includes(item));
      setSelectedItems([...newSelectedItems]);
    }
  }

  function handleToggleItemSelection(itemId: string) {
    const itemIndex = selectedItems.findIndex((item) => item === itemId);

    if (itemIndex === -1) {
      setSelectedItems([...selectedItems, itemId]);
      return;
    }

    setSelectedItems(selectedItems.filter((item) => item !== itemId));
  }

  async function handleAction({
    actionEndPoint,
    method,
    pathsToRevalidate,
    tagsToRevalidate,
  }: CheckBoxActionSubmit): Promise<void> {
    try {
      const formSubmissionResult = await tableFormAction({
        endPoint: actionEndPoint,
        values: selectedItems,
        method,
        tagsToRevalidate,
        pathsToRevalidate,
      });

      if (checkBoxPerLine) {
        setSelectedItems((prevState) => {
          const newSelectedItems = data
            .map((item) => String(item[checkBoxPerLine.label]))
            .filter(
              (item) =>
                !selectedItems.includes(item) && prevState.includes(item)
            );

          return [...newSelectedItems];
        });
      }

      toast({
        title: t("toast.successTitle"),
        description: formSubmissionResult,
        action: <CheckCircle className="h-7 w-7 text-green-500" />,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("toast.errorTitle"),
        description:
          error instanceof Error ? error.message : t("toast.errorDescription"),
        action: <XCircle className="h-7 w-7 text-destructive-foreground" />,
      });
    }
  }

  return (
    <div className={className} id={tableId} {...rest}>
      <TableHeader
        tableId={tableId}
        caption={caption}
        showSearchBar={showSearchBar}
        checkBoxPerLine={checkBoxPerLine}
        headerActions={headerActions}
        selectedItems={selectedItems}
        handleAction={handleAction}
      />
      {data.length === 0 && (
        <div className="my-5">
          <EmptyState
            title={emptyState ? emptyState.title : t("empty.defaultTitle")}
            description={
              emptyState
                ? emptyState.description
                : t("empty.defaultDescription")
            }
            icon={emptyState ? emptyState.icon : Clipboard}
          />
        </div>
      )}
      {data.length > 0 && (
        <MainTable
          caption={caption}
          tableColumns={tableColumns}
          data={data}
          checkBoxPerLine={checkBoxPerLine}
          selectedItems={selectedItems}
          handleToggleAllSelection={handleToggleAllSelection}
          handleToggleItemSelection={handleToggleItemSelection}
        />
      )}
      {/* {data.length > 0 && showPagination && (
        <TablePagination
          dataLength={totalOfRecords || data.length}
          numberPerPage={numberPerPage || 10}
          tableId={tableId}
        />
      )} */}
      {checkBoxPerLine && data.length > 0 && (
        <div className="d-flex flex-wrap align-items-center justify-content-center mt-5x">
          {checkBoxPerLine?.actions.map(
            ({
              label,
              method,
              Icon,
              endPointActionRoute,
              pathsToRevalidate,
              tagsToRevalidate,
            }) => (
              <Button
                title={label}
                key={method}
                variant="outline"
                disabled={selectedItems.length === 0}
                onClick={() =>
                  handleAction({
                    actionEndPoint: endPointActionRoute,
                    method,
                    pathsToRevalidate,
                    tagsToRevalidate,
                  })
                }
              >
                {Icon}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
