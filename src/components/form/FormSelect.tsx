"use client";

import { Control } from "react-hook-form";
import { LucideIcon } from "lucide-react";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interface para definir o formato das opções
export interface SelectOption {
  label: string;
  value: string;
  icon?: LucideIcon;
}

interface FormSelectProps {
  control: Control<any>;
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}

export function FormSelect({
  control,
  name,
  label,
  options,
  placeholder = "Selecione...",
  description,
  disabled,
}: FormSelectProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {option.icon && (
                      <option.icon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
