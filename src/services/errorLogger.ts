
import { ErrorLogData } from "@/app/api/errors/errorLoggerSchema";
import { httpClient } from "@/lib/httpClient";
import { apiLogger } from "@/lib/logger";

type ErrorLoggerResponse = {
  success?: boolean
  error?: boolean
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function errorLogger(errorLogData: ErrorLogData): Promise<void> {

  const [resposeError] = await httpClient<ErrorLoggerResponse>(`${baseUrl}/api/errors`, {
    method: 'post',
    cache: 'no-cache',
    body: JSON.stringify(errorLogData)
  });

  if (resposeError) {
    apiLogger.error({ stackTrace: resposeError }, "Error trying to log error");
  }

}