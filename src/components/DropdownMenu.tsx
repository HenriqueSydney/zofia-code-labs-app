import {
  DropdownMenu as ShadnacnDropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { LucideIcon, MoreHorizontal } from "lucide-react";
import { cn } from "@/utils/twMerge";

export type DrowpdownMenuItemsType =
  | {
      type: "action";
      label: string;
      icon: LucideIcon;
      onClick: () => void;
      className?: string;
    }
  | { type: "separator" };

interface IDropdownMenu {
  label: string;
  tooltip?: string;
  TriggerIcon?: LucideIcon;
  menuItems: DrowpdownMenuItemsType[];
}

export function DropdownMenu({
  menuItems,
  label,
  tooltip = "Abrir menu",
  TriggerIcon = MoreHorizontal,
}: IDropdownMenu) {
  return (
    <ShadnacnDropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" title={tooltip}>
          <span className="sr-only">{tooltip}</span>
          <TriggerIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>

        {/* Mapeamento dos itens */}
        {menuItems.map((item, index) => {
          if (item.type === "separator") {
            return <DropdownMenuSeparator key={`sep-${index}`} />;
          }

          const Icon = item.icon;

          return (
            <DropdownMenuItem
              key={item.label}
              onClick={item.onClick}
              className={cn("cursor-pointer", item.className)}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </ShadnacnDropdownMenu>
  );
}
