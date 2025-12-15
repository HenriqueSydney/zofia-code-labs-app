"use client";

import React, { forwardRef, ForwardRefRenderFunction } from "react";
import { FieldError } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { cn } from "@/lib/utils"; // Utilitário padrão do shadcn
import { Label } from "@/components/ui/label"; // Se não tiver, troque por <label> nativo com classes
import { convertPatternToIMask } from "@/utils/mask";

interface InputMaskProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "onBlur"
  > {
  label?: string;
  inputError?: FieldError;
  icon?: React.ReactNode;
  mask: string;
  unmask?: boolean;
  onBlur?: (event: { target: { name?: string; value: string } }) => void;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
}

const InputMaskBase: ForwardRefRenderFunction<
  HTMLInputElement,
  InputMaskProps
> = (
  {
    className,
    label,
    inputError,
    icon,
    name,
    required,
    mask,
    unmask = false,
    onChange,
    onBlur,
    value,
    ...rest
  },
  ref
) => {
  // Converte padrão customizado (###.###) para padrão IMask (000.000)
  const imaskPattern = convertPatternToIMask(mask);

  // Classes padrão do Input do shadcn (copiadas do componente ui/input.tsx)
  const inputClasses = cn(
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    inputError && "border-destructive focus-visible:ring-destructive", // Estilo de erro
    icon && "pr-10", // Espaço extra à direita se houver ícone
    className
  );

  return (
    <div className="w-full space-y-2">
      {label && (
        <Label htmlFor={name} className={cn(inputError && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <IMaskInput
          className={inputClasses}
          mask={imaskPattern}
          unmask={unmask}
          value={String(value || "")}
          onAccept={(maskedValue, maskRef) => {
            const finalValue = unmask ? maskRef.unmaskedValue : maskedValue;
            onChange?.({
              target: {
                name,
                value: finalValue,
              },
            });
          }}
          onBlur={() => {
            const finalValue = unmask
              ? String(value || "").replace(/\D/g, "")
              : String(value || "");

            // CORREÇÃO AQUI:
            // O 'as any' é necessário porque estamos "enganando" o sistema
            // passando um objeto simples onde ele espera um Evento DOM complexo.
            // O React Hook Form aceita isso tranquilamente, mas o TS reclama.
            onBlur?.({
              target: {
                name: name || "",
                value: finalValue,
              },
            } as any);
          }}
          name={name}
          id={name}
          required={required}
          // @ts-ignore - Tipagem do IMaskInput vs HTMLInput
          inputRef={ref}
          {...rest}
        />

        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      {inputError && (
        <p className="text-sm font-medium text-destructive">
          {inputError.message}
        </p>
      )}
    </div>
  );
};

export const InputMask = forwardRef(InputMaskBase);
