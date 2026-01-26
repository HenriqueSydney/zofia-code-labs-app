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

interface FormInputProps {
  control: Control<any>;
  name: string;
  label: string;
  type?: React.HTMLInputTypeAttribute; // Permite "text", "email", "url", "number", etc.
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}

export function FormInput({
  control,
  name,
  label,
  type = "text", // Padrão é texto
  placeholder,
  description,
  disabled,
}: FormInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              value={field.value ?? ""} // Proteção contra valor null
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}