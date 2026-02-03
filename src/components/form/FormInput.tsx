"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LucideIcon } from "lucide-react";
import { ComponentProps } from "react";

interface FormInputProps extends ComponentProps<"input"> {
  control: Control<any>;
  name: string;
  label: string;
  type?: React.HTMLInputTypeAttribute; // Permite "text", "email", "url", "number", etc.
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  Icon?: LucideIcon;
}

export function FormInput({
  control,
  name,
  label,
  type = "text", // Padrão é texto
  placeholder,
  description,
  disabled,
  Icon,
  ...props
}: FormInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={type}
                placeholder={placeholder}
                disabled={disabled || props.readOnly}
                {...field}
                {...props}
                value={field.value ?? ""} // Proteção contra valor null
              />
              {Icon && (
                <Icon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
