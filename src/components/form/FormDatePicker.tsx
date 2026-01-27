"use client";

import { CalendarIcon } from "lucide-react";
import { Control } from "react-hook-form";
import { ptBR } from "date-fns/locale"; // Necessário APENAS para a grid do calendário (Mo/Tu/We -> Seg/Ter/Qua)

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { date as dayjs } from "@/lib/dayjs";

interface FormDatePickerProps {
  control: Control<any>;
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function FormDatePicker({
  control,
  name,
  label,
  description,
  placeholder = "Selecione uma data",
  disabled,
  minDate,
  maxDate,
}: FormDatePickerProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  disabled={disabled}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value ? (
                    // AQUI ESTÁ A MUDANÇA: Usando Dayjs para formatar
                    // "DD [de] MMMM [de] YYYY" resulta em "26 de janeiro de 2026"
                    // A primeira letra do mês minúscula é padrão do pt-br, se quiser maiúscula use CSS capitalize
                    <span>
                      {dayjs(field.value).format("DD/MM/YYYY")}
                    </span>
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                // O Calendar do Shadcn espera um objeto Date nativo JS.
                // Se seu formulário já guarda Date, passe direto.
                // Se seu formulário guarda Dayjs, use field.value.toDate()
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => {
                  if (disabled) return true;
                  // Comparação usando Dayjs para consistência
                  if (minDate && dayjs(date).isBefore(dayjs(minDate), "day"))
                    return true;
                  if (maxDate && dayjs(date).isAfter(dayjs(maxDate), "day"))
                    return true;
                  return false;
                }}
                initialFocus
                // Mantemos o locale do date-fns aqui APENAS para traduzir o cabeçalho do calendário (Seg, Ter, Qua...)
                // Pois o componente Calendar é construído sobre react-day-picker que usa date-fns nativamente
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
