"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/twMerge";

interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface FormRadioCardsProps {
  control: Control<any>;
  name: string;
  label?: string;
  options: RadioCardOption[];
  className?: string;
  gridColumns?: number;
}

export function FormRadioCards({
  control,
  name,
  label,
  options,
  className,
  gridColumns = 2,
}: FormRadioCardsProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
              className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", `md:grid-cols-${gridColumns}`)}
            >
              {options.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={`${name}-${option.value}`}
                    disabled={option.disabled}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`${name}-${option.value}`}
                    className={cn(
                      "cursor-pointer flex flex-col items-center justify-center text-center h-full rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary [&:has([data-state=checked])]:border-primary transition-all",
                      option.disabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <span className="font-semibold">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground mt-1 font-normal">
                        {option.description}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
