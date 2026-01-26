import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface IRegressStrategy {
  schema: z.ZodObject<any>;
  defaultValues: any;
  renderExtraFields?: (form: any) => React.ReactNode;
}

export const REGRESS_STRATEGIES: Record<string, IRegressStrategy> = {
  // RETORNO: PROPOSTA -> ANÁLISE TÉCNICA
  TECH_ANALYSIS: {
    schema: z.object({
      observation: z
        .string()
        .min(10, "A justificativa deve ter no mínimo 10 caracteres"),
      motivation: z.enum(
        ["SCOPE_CHANGE", "TECHNICAL_ERROR", "MISSING_DOCS", "CLIENT_REQUEST"],
        {
          error: "Selecione o motivo técnico",
        }
      ),
    }),
    defaultValues: { observation: "", motivation: "" },
    renderExtraFields: (form) => (
      <FormField
        control={form.control}
        name="motivation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Motivo da Reanálise Técnica</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo técnico..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="SCOPE_CHANGE">Mudança de Escopo</SelectItem>
                <SelectItem value="TECHNICAL_ERROR">
                  Inconsistência Identificada
                </SelectItem>
                <SelectItem value="MISSING_DOCS">
                  Documentação Incompleta
                </SelectItem>
                <SelectItem value="CLIENT_REQUEST">
                  Solicitação de Revisão pelo Cliente
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
  },

  // RETORNO: CONTRATO -> PROPOSTA
  PROPOSAL: {
    schema: z.object({
      observation: z
        .string()
        .min(10, "A justificativa deve ter no mínimo 10 caracteres"),
      motivation: z.enum(
        [
          "PRICE_ADJUSTMENT",
          "TYPO_ERROR",
          "COMMERCIAL_NEGOTIATION",
          "PAYMENT_TERM_CHANGE",
        ],
        {
          error: "Selecione o motivo comercial",
        }
      ),
    }),
    defaultValues: { observation: "", motivation: "" },
    renderExtraFields: (form) => (
      <FormField
        control={form.control}
        name="motivation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Motivo da Revisão Comercial</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo comercial..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="PRICE_ADJUSTMENT">
                  Ajuste de Valores/Descontos
                </SelectItem>
                <SelectItem value="TYPO_ERROR">
                  Erro de Digitação/Dados
                </SelectItem>
                <SelectItem value="COMMERCIAL_NEGOTIATION">
                  Nova Negociação Comercial
                </SelectItem>
                <SelectItem value="PAYMENT_TERM_CHANGE">
                  Alteração de Condição de Pgto
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
  },

  DEFAULT: {
    schema: z.object({
      observation: z.string().min(10, "Mínimo 10 caracteres"),
    }),
    defaultValues: { observation: "" },
  },
};
