"use client";
import { EllipsisVertical } from "lucide-react";
import { Fragment, useState } from "react";
import { CheckBoxActionSubmit, CheckBoxPerLineConfig } from "..";

interface ITableHeaderItensSelection {
  tableId: string;
  checkBoxPerLine: CheckBoxPerLineConfig;
  selectedItems: string[];
  handleAction: (data: CheckBoxActionSubmit) => Promise<void>;
}
export function TableHeaderItensSelection({
  tableId,
  checkBoxPerLine,
  selectedItems,
  handleAction,
}: ITableHeaderItensSelection) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  function handleToggleSelectionBox() {
    setIsOptionsOpen((prevState) => !prevState);
  }
  const selectedItemsLength = selectedItems.length;
  return (
    <div
      className={`selected-bar ${selectedItems.length > 0 ? "show" : ""}`}
      id={`${tableId}-table-selection`}
    >
      <div className="info">
        <span className="count">{selectedItemsLength}</span>
        <span className="text">
          {selectedItemsLength > 0 ? "itens selecionados" : "item selecionado"}
        </span>
      </div>
      <div
        className={`actions-trigger text-nowrap ${isOptionsOpen ? "dropdown" : ""}`}
      >
        <button
          id={`${tableId}-button-dropdown-selection`}
          className="br-button circle inverted"
          type="button"
          data-toggle="dropdown"
          aria-controls={`${tableId}-list-dropdown-selection`}
          aria-label="Ver mais opções de ação"
          aria-haspopup="true"
          aria-expanded={!isOptionsOpen}
          onClick={handleToggleSelectionBox}
        >
          <EllipsisVertical className="w-16 h-16" />
        </button>
        <div
          className="br-list"
          id={`${tableId}-list-dropdown-selection`}
          role="menu"
          aria-hidden={!isOptionsOpen}
          aria-labelledby={`${tableId}-button-dropdown-selection`}
          style={{ display: isOptionsOpen ? "block" : "none" }}
        >
          {checkBoxPerLine.actions.map(
            (
              {
                label,
                Icon,
                endPointActionRoute,
                method,
                pathsToRevalidate,
                tagsToRevalidate,
              },
              index,
              array
            ) => (
              <Fragment key={`dropdown-${method}-table-action`}>
                <button
                  className="br-item d-flex align-items-center gap-3"
                  type="button"
                  data-toggle=""
                  role="menuitem"
                  onClick={() => {
                    handleAction({
                      actionEndPoint: endPointActionRoute,
                      method,
                      pathsToRevalidate,
                      tagsToRevalidate,
                    });
                    handleToggleSelectionBox();
                  }}
                >
                  {Icon && Icon}
                  {label}
                </button>
                {index !== array.length - 1 && (
                  <span className="br-divider"></span>
                )}
              </Fragment>
            )
          )}
        </div>
      </div>
    </div>
  );
}
