"use client";

import { Control } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { InputMask } from "../InputMask";
import { LucideIcon } from "lucide-react";

// Herdamos as props do seu componente original para manter o Intellisense
interface FormMaskInputProps extends Omit<
  React.ComponentProps<typeof InputMask>,
  "icon"
> {
  control: Control<any>;
  name: string;
  Icon?: LucideIcon;
}

export function FormMaskInput({
  control,
  name,
  Icon,
  ...props // (label, mask, icon, placeholder, etc...)
}: FormMaskInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <InputMask
          // Conexão com o React Hook Form
          name={field.name}
          ref={field.ref}
          value={field.value}
          onBlur={field.onBlur}
          onChange={field.onChange} // Seu componente já trata o evento { target: { value } } corretamente
          disabled={field.disabled}
          // Passagem de Erro (O seu componente sabe renderizar isso)
          inputError={fieldState.error}
          icon={Icon && <Icon className="h-4 w-4" />}
          // Repassa todas as outras props (label, mask, icon, unmask...)
          {...props}
        />
      )}
    />
  );
}
