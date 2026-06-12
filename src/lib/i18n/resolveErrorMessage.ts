import { getTranslations } from "next-intl/server";
import { ZodError } from "zod";

import { AppError } from "@/errors/AppError";
import { LEGACY_ERROR_MAP } from "./legacyErrorMap";

async function translateValidationKey(
  key: string,
  params?: Record<string, string | number>,
): Promise<string | null> {
  try {
    const t = await getTranslations("validation");
    return t(key as Parameters<typeof t>[0], params);
  } catch {
    return null;
  }
}

function resolveKey(raw: string): string | null {
  if (LEGACY_ERROR_MAP[raw]) {
    return LEGACY_ERROR_MAP[raw];
  }

  if (raw.startsWith("errors.server.")) {
    return raw.replace("errors.server.", "");
  }

  if (/^[a-z][a-zA-Z0-9.]*$/.test(raw) && !raw.includes(" ")) {
    return raw;
  }

  return null;
}

export async function resolveErrorMessage(
  error: unknown,
  params?: Record<string, string | number>,
): Promise<string> {
  const t = await getTranslations("errors.server");

  if (error instanceof ZodError) {
    const firstMessage = error.issues[0]?.message ?? "invalidData";
    const validationMessage = await translateValidationKey(firstMessage, params);
    if (validationMessage) {
      return validationMessage;
    }
    const key = resolveKey(firstMessage);
    if (key) {
      return t(key as Parameters<typeof t>[0], params);
    }
    return firstMessage;
  }

  if (error instanceof AppError) {
    const key =
      error.i18nKey ??
      resolveKey(error.message) ??
      (error.message.includes("Transição de")
        ? "contractInvalidTransition"
        : null);

    if (key) {
      return t(key as Parameters<typeof t>[0], {
        ...error.i18nParams,
        ...params,
      });
    }

    if (error.message.includes("Transição de")) {
      return error.message;
    }

    return error.message;
  }

  if (error instanceof Error) {
    const key = resolveKey(error.message);
    if (key) {
      return t(key as Parameters<typeof t>[0], params);
    }
    return error.message;
  }

  if (typeof error === "string") {
    const key = resolveKey(error);
    if (key) {
      if (key.startsWith("success.")) {
        const successKey = key.replace("success.", "");
        const tSuccess = await getTranslations("errors.server.success");
        return tSuccess(successKey as Parameters<typeof tSuccess>[0], params);
      }
      return t(key as Parameters<typeof t>[0], params);
    }
    return error;
  }

  return t("unexpected");
}

export async function resolveSuccessMessage(
  key: string,
  params?: Record<string, string | number>,
): Promise<string> {
  const t = await getTranslations("errors.server.success");
  return t(key as Parameters<typeof t>[0], params);
}
