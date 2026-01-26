"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { generateSlug } from "@/utils/generateSlug";

interface FormInputSlugProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export function FormInputSlug({
  control,
  name,
  label,
  placeholder,
  disabled,
}: FormInputSlugProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} disabled={disabled} {...field} />
          </FormControl>
          {/* Área de Preview do Slug */}
          <div className="text-muted-foreground text-sm mt-1">
            <strong>Slug:</strong>{" "}
            <span className="font-mono bg-muted px-1 rounded">
              {generateSlug({ title: field.value || "" })}
            </span>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
