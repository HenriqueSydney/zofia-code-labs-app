"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
}

interface FormMultiCheckboxProps {
  control: Control<any>;
  name: string;
  label: string;
  options: Option[];
  description?: string;
  disabled?: boolean;
  className?: string; // Para customizar o container (ex: grid-cols-2)
}

export function FormMultiCheckbox({
  control,
  name,
  label,
  options,
  description,
  disabled,
  className,
}: FormMultiCheckboxProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>

          {/* Área com Scroll se tiver muitos itens */}
          <div
            className={cn(
              "grid gap-2 border rounded-md p-4 bg-muted/10 max-h-[300px] overflow-y-auto",
              className,
            )}
          >
            {options.map((item) => (
              <FormField
                key={item.id}
                control={control}
                name={name}
                render={({ field }) => {
                  return (
                    <FormItem
                      key={item.id}
                      className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2 bg-background hover:bg-accent/50 transition-colors"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item.id)}
                          disabled={disabled}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, item.id])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: string) => value !== item.id,
                                  ),
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer w-full text-sm">
                        {item.label}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
