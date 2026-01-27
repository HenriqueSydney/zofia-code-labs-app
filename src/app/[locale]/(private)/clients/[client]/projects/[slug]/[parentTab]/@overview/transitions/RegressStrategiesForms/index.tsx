import { FormSelect } from "@/components/form/FormSelect";
import { z } from "zod";
// Import Textarea se você usar ele em outro lugar do código,
// mas para o Select ele não é mais necessário aqui dentro.

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
        },
      ),
    }),
    defaultValues: { observation: "", motivation: "" },
    renderExtraFields: (form) => (
      <FormSelect
        control={form.control}
        name="motivation"
        label="Motivo da Reanálise Técnica"
        placeholder="Selecione o motivo técnico..."
        options={[
          { value: "SCOPE_CHANGE", label: "Mudança de Escopo" },
          { value: "TECHNICAL_ERROR", label: "Inconsistência Identificada" },
          { value: "MISSING_DOCS", label: "Documentação Incompleta" },
          {
            value: "CLIENT_REQUEST",
            label: "Solicitação de Revisão pelo Cliente",
          },
        ]}
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
        },
      ),
    }),
    defaultValues: { observation: "", motivation: "" },
    renderExtraFields: (form) => (
      <FormSelect
        control={form.control}
        name="motivation"
        label="Motivo da Revisão Comercial"
        placeholder="Selecione o motivo comercial..."
        options={[
          { value: "PRICE_ADJUSTMENT", label: "Ajuste de Valores/Descontos" },
          { value: "TYPO_ERROR", label: "Erro de Digitação/Dados" },
          {
            value: "COMMERCIAL_NEGOTIATION",
            label: "Nova Negociação Comercial",
          },
          {
            value: "PAYMENT_TERM_CHANGE",
            label: "Alteração de Condição de Pgto",
          },
        ]}
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
