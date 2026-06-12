"use client";

import { Control } from "react-hook-form";
import { LucideIcon } from "lucide-react";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/utils/twMerge";

interface FormSwitchCardProps {
  control: Control<any>;
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
}

export function FormSwitchCard({
  control,
  name,
  label,
  description,
  disabled,
  icon: Icon,
  className,
}: FormSwitchCardProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/20",
            className,
          )}
        >
          <div className="space-y-0.5">
            <FormLabel className="flex items-center gap-2 text-base">
              {Icon && <Icon className="w-4 h-4 text-primary" />}
              {label}
            </FormLabel>
            {description && (
              <FormDescription className="text-xs">
                {description}
              </FormDescription>
            )}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
