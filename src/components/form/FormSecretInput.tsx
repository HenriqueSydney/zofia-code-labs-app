"use client";

import { useState } from "react";
import { Control } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FormSecretInputProps {
  control: Control<any>; // Permite passar o control do formulário pai
  name: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function FormSecretInput({
  control,
  name,
  label,
  hint,
  disabled,
  placeholder,
}: FormSecretInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => setShowPassword(!showPassword);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center">
            <FormLabel className="text-sm">{label}</FormLabel>
            {hint && (
              <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1.5 rounded border">
                {hint}
              </span>
            )}
          </div>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                disabled={disabled}
                className="pr-10" // Padding à direita para o texto não bater no ícone
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={toggleVisibility}
                disabled={disabled}
                tabIndex={-1} // Evita focar no botão ao usar Tab
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Esconder senha" : "Ver senha"}
                </span>
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
