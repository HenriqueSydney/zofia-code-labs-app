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

interface FormNumberInputProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function FormNumberInput({
  control,
  name,
  label,
  placeholder,
  description,
  disabled,
  min,
  max,
  step,
}: FormNumberInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={placeholder}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
              {...field}
              // A mágica acontece aqui: Sobrescrevemos o onChange do field
              onChange={(e) => {
                const value = e.target.value;
                // Se estiver vazio, define como undefined (ou 0 se preferir, mas undefined é melhor para "não preenchido")
                // Se tiver valor, converte para Number
                const parsedValue = value === "" ? undefined : Number(value);
                field.onChange(parsedValue);
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}