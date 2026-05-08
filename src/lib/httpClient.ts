/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";

import { apiLogger } from "./logger";
import { handleErrors } from "@/errors/handleErrors";
import { envVariables } from "@/env";
import { revalidatePath } from "next/cache";
import jwt from "jsonwebtoken";

type IHttpClientResponse<T> = [Error, null] | [null, T];

type HttpResponseType = "json" | "blob" | "text" | "arrayBuffer" | "formData";

export async function httpClient<T>(
  url: string,
  options?: RequestInit & { revalidatePath?: string[] },
  responseType: HttpResponseType = "json"
): Promise<IHttpClientResponse<T>> {
  if (!url) {
    return Promise.resolve([new Error("URL is required"), null]);
  }

  if (url.startsWith("/api/")) {
    url = `${envVariables.BASE_URL}${url}`;
  }

  // Gerar identificador único para a operação HTTP
  const operationId = `http:${
    options?.method ? options.method.toLowerCase() : "get"
  }:${url.replace(/https?:\/\//, "").replace(/[^a-zA-Z0-9]/g, "_")}`;

  const method = options?.method ?? "GET";
  const cache =
    options?.cache === "default" || options?.cache === "force-cache";
  const revalidate = options?.next?.revalidate;
  const tags = options?.next?.tags ?? [];
  const revalidatePaths = options?.revalidatePath ?? [];

  const otelOptions = {
    kind: SpanKind.CLIENT, // Indica chamada externa
    attributes: {
      "http.endpoint": url,
      "http.operation": operationId,
      "cache.enabled": cache ? cache : "false",
      "cache.revalidate": revalidate?.toString(),
      "cache.tags": tags ? tags.join("; ") : "",
    },
  };

  const tracer = trace.getTracer("professional-portfolio");
  return await tracer.startActiveSpan(
    operationId,
    otelOptions,
    async (span) => {
      const start = performance.now();
      try {
        const cacheKeyData = {
          body: options?.body ?? "",
        };

        const token = jwt.sign(
          { service: "internal-client" },
          envVariables.JWT_TOKEN_SECRET,
          { expiresIn: "2m" } // expira em 5 minutos
        );
        const response = await fetch(url, {
          ...options,
          headers: {
            ...(options?.headers || {}),
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          next: {
            revalidate: false,
          },
        });

        if (!response.ok) {
          const errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
          return [
            new Error(errorMessage),
            null,
          ] satisfies IHttpClientResponse<T>;
        }

        let data: T | Blob | string | ArrayBuffer | FormData;

        switch (responseType) {
          case "blob":
            data = await response.blob();
            break;
          case "text":
            data = await response.text();
            break;
          case "arrayBuffer":
            data = await response.arrayBuffer();
            break;
          case "formData":
            data = await response.formData();
            break;
          case "json":
          default:
            data = await response.json();
            break;
        }

        if (method !== "GET" && revalidatePaths.length > 0) {
          revalidatePaths.forEach((path) => revalidatePath(path));
        }

        return [null, data as T] satisfies IHttpClientResponse<T>;
      } catch (error: any) {
        handleErrors(error, null, {
          message: "HTTP request error",
        });
        span.setAttribute("cache.hit", false);
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message }); // ERROR
        return [error as Error, null] satisfies IHttpClientResponse<T>;
      } finally {
        span.setAttribute("execution.ms", performance.now() - start);
        span.end();
      }
    }
  );
}
