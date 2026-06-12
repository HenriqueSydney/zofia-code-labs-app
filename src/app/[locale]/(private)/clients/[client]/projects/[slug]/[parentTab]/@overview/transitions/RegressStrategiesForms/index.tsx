import { FormSelect } from "@/components/form/FormSelect";
import { z } from "zod";

export interface IRegressStrategy {
  schema: z.ZodObject<any>;
  defaultValues: any;
  renderExtraFields?: (form: any) => React.ReactNode;
}

type RegressTranslator = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export function getRegressStrategies(
  t: RegressTranslator,
): Record<string, IRegressStrategy> {
  return {
    TECH_ANALYSIS: {
      schema: z.object({
        observation: z
          .string()
          .min(10, t("validation.observationMin")),
        motivation: z.enum(
          ["SCOPE_CHANGE", "TECHNICAL_ERROR", "MISSING_DOCS", "CLIENT_REQUEST"],
          {
            error: t("techAnalysis.validation.motivationRequired"),
          },
        ),
      }),
      defaultValues: { observation: "", motivation: "" },
      renderExtraFields: (form) => (
        <FormSelect
          control={form.control}
          name="motivation"
          label={t("techAnalysis.fields.motivation.label")}
          placeholder={t("techAnalysis.fields.motivation.placeholder")}
          options={[
            {
              value: "SCOPE_CHANGE",
              label: t("techAnalysis.motivations.SCOPE_CHANGE"),
            },
            {
              value: "TECHNICAL_ERROR",
              label: t("techAnalysis.motivations.TECHNICAL_ERROR"),
            },
            {
              value: "MISSING_DOCS",
              label: t("techAnalysis.motivations.MISSING_DOCS"),
            },
            {
              value: "CLIENT_REQUEST",
              label: t("techAnalysis.motivations.CLIENT_REQUEST"),
            },
          ]}
        />
      ),
    },

    PROPOSAL: {
      schema: z.object({
        observation: z
          .string()
          .min(10, t("validation.observationMin")),
        motivation: z.enum(
          [
            "PRICE_ADJUSTMENT",
            "TYPO_ERROR",
            "COMMERCIAL_NEGOTIATION",
            "PAYMENT_TERM_CHANGE",
          ],
          {
            error: t("proposal.validation.motivationRequired"),
          },
        ),
      }),
      defaultValues: { observation: "", motivation: "" },
      renderExtraFields: (form) => (
        <FormSelect
          control={form.control}
          name="motivation"
          label={t("proposal.fields.motivation.label")}
          placeholder={t("proposal.fields.motivation.placeholder")}
          options={[
            {
              value: "PRICE_ADJUSTMENT",
              label: t("proposal.motivations.PRICE_ADJUSTMENT"),
            },
            {
              value: "TYPO_ERROR",
              label: t("proposal.motivations.TYPO_ERROR"),
            },
            {
              value: "COMMERCIAL_NEGOTIATION",
              label: t("proposal.motivations.COMMERCIAL_NEGOTIATION"),
            },
            {
              value: "PAYMENT_TERM_CHANGE",
              label: t("proposal.motivations.PAYMENT_TERM_CHANGE"),
            },
          ]}
        />
      ),
    },

    DEFAULT: {
      schema: z.object({
        observation: z.string().min(10, t("default.validation.observationMin")),
      }),
      defaultValues: { observation: "" },
    },
  };
}
