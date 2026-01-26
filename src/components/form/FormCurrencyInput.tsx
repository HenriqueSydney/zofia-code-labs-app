"use client";

import { Control } from "react-hook-form";
import { NumericFormat } from "react-number-format";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormCurrencyInputProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}

export function FormCurrencyInput({
  control,
  name,
  label,
  placeholder,
  description,
  disabled,
}: FormCurrencyInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { onChange, name, value, ref, onBlur } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <NumericFormat
              customInput={Input} // Usa o Input do Shadcn para manter o estilo
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale // Força sempre mostrar casas decimais (ex: 10,00)
              allowNegative={false} // Geralmente preços não são negativos
              placeholder={placeholder}
              disabled={disabled}
              // Conexão com o React Hook Form:
              name={name}
              value={value}
              onBlur={onBlur}
              getInputRef={ref}
              onValueChange={(values) => {
                // Aqui está a mágica: enviamos o floatValue (ex: 1250.50) para o form
                // Se estiver vazio, enviamos undefined para não quebrar validações opcionais
                onChange(
                  values.floatValue === undefined
                    ? undefined
                    : values.floatValue,
                );
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
