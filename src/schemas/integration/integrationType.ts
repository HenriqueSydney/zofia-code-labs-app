import { v } from "@/schemas/validationMessages";
import z from "zod";

export const integrationFieldKeyTypes = ["TAG", "PUBLIC_KEY", "SECRET"] as const;

export const integrationFieldInputTypes = [
  "text",
  "password",
  "email",
  "url",
] as const;

export const integrationFieldSchema = z.object({
  key: z.string().min(1, v.integrationKeyRequired),
  label: z.string().min(1, v.integrationLabelRequired),
  type: z.enum(integrationFieldInputTypes),
  keyType: z.enum(integrationFieldKeyTypes),
  dependsOnByol: z.boolean().default(false),
  required: z.boolean().default(true),
});

export const integrationTypeSchema = z.object({
  name: z.string().min(2, v.integrationNameRequired),
  logo: z.string().optional().or(z.literal("")).nullable(),
  description: z.string(),
  enableByol: z.boolean().default(false),
  externalDocsUrl: z.url(v.documentationUrlInvalid).optional(),
  fieldsSchema: z.array(integrationFieldSchema),
});

export const updateIntegrationTypeSchema = integrationTypeSchema
  .partial()
  .extend({
    id: z.cuid(v.invalidId),
  });

export type IntegrationFieldKeyType = (typeof integrationFieldKeyTypes)[number];
export type IntegrationFieldInputType = (typeof integrationFieldInputTypes)[number];
export type IntegrationFieldSchema = z.infer<typeof integrationFieldSchema>;
export type IntegrationTypeData = z.infer<typeof integrationTypeSchema>;
export type UpdateIntegrationTypeData = z.infer<
  typeof updateIntegrationTypeSchema
>;

export function getDefaultInputTypeForKeyType(
  keyType: IntegrationFieldKeyType,
): IntegrationFieldInputType {
  switch (keyType) {
    case "TAG":
    case "PUBLIC_KEY":
      return "text";
    case "SECRET":
      return "password";
  }
}

export function isSecretKeyType(keyType: IntegrationFieldKeyType): boolean {
  return keyType === "SECRET";
}

export function isTagIntegrationField(
  field: Record<string, unknown>,
): boolean {
  if (field.keyType === "TAG") {
    return true;
  }

  return field.type === "tag";
}

export function getInfisicalIntegrationFields(
  fieldsSchema: Record<string, unknown>[],
): Record<string, unknown>[] {
  return fieldsSchema.filter((field) => !isTagIntegrationField(field));
}

export function getInfisicalIntegrationFieldKeys(
  fieldsSchema: Record<string, unknown>[],
): string[] {
  return getInfisicalIntegrationFields(fieldsSchema).map((field) =>
    String(field.key),
  );
}

export function filterInfisicalKeys(
  keys: string[],
  fieldsSchema: Record<string, unknown>[],
): string[] {
  if (fieldsSchema.length === 0) {
    return keys;
  }

  const tagKeys = new Set(
    fieldsSchema
      .filter(isTagIntegrationField)
      .map((field) => String(field.key)),
  );

  return keys.filter((key) => !tagKeys.has(key));
}

function normalizeLegacyInputType(
  type: string | undefined,
): IntegrationFieldInputType | undefined {
  if (!type || type === "tag") {
    return undefined;
  }

  if (integrationFieldInputTypes.includes(type as IntegrationFieldInputType)) {
    return type as IntegrationFieldInputType;
  }

  return undefined;
}

export function normalizeIntegrationFieldSchema(
  field: Record<string, unknown>,
): IntegrationFieldSchema {
  if (
    typeof field.keyType === "string" &&
    integrationFieldKeyTypes.includes(field.keyType as IntegrationFieldKeyType)
  ) {
    const keyType = field.keyType as IntegrationFieldKeyType;
    return integrationFieldSchema.parse({
      key: field.key,
      label: field.label,
      keyType,
      type:
        normalizeLegacyInputType(field.type as string | undefined) ??
        getDefaultInputTypeForKeyType(keyType),
      dependsOnByol: field.dependsOnByol ?? false,
      required: field.required ?? true,
    });
  }

  const legacyType = field.type as string | undefined;
  const legacyIsSecret = field.isSecret === true;

  let keyType: IntegrationFieldKeyType = "PUBLIC_KEY";
  if (legacyType === "tag") {
    keyType = "TAG";
  } else if (legacyIsSecret || legacyType === "password") {
    keyType = "SECRET";
  }

  return integrationFieldSchema.parse({
    key: field.key,
    label: field.label,
    keyType,
    type:
      normalizeLegacyInputType(legacyType) ??
      getDefaultInputTypeForKeyType(keyType),
    dependsOnByol: field.dependsOnByol ?? false,
    required: field.required ?? true,
  });
}
