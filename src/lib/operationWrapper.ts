import { SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";
import { apiLogger } from "./logger";
import type {
  OperationWrapperOptions,
  OperationWrapperResponse,
} from "@/@types/OperationWrapperTypes";
import { handleErrors } from "@/errors/handleErrors";
import { revalidatePath } from "next/cache";

export async function operationWrapper<T>(
  operationType: "repository" | "action",
  operationName: string,
  callback: () => Promise<T>,
  options: OperationWrapperOptions = {},
): Promise<OperationWrapperResponse<T>> {
  const {
    cache = "force-cache",
    revalidate = 0,
    tags = [],
    params = "",
    revalidatePaths = [],
  } = options;
  const attributeKey = `${operationType}.operation`;
  const otelOptions = {
    kind: SpanKind.CLIENT, // Indica chamada externa
    attributes: {
      [attributeKey]: operationName,
      "cache.enabled": cache,
      "cache.revalidate": revalidate.toString(),
      "cache.tags": tags.join("; "),
    },
  };

  const tracer = trace.getTracer("professional-portfolio");
  return await tracer.startActiveSpan(
    operationName,
    otelOptions,
    async (span) => {
      const start = performance.now();
      try {
        const effectiveCache = cache === "force-cache";

        if (cache === "revalidate-tags" && tags.length > 0) {
          apiLogger.debug(`Invalidating cache for tags: ${tags.join(", ")}`);
          span.setAttribute("cache.invalidated_tags", tags.join("; "));

          setImmediate(async () => {
            try {
              // await redisClient.invalidateCacheByTags(
              //   `${operationType}:tag`,
              //   tags
              // );
              apiLogger.debug(
                `Successfully invalidated cache for tags: ${tags.join(", ")}`,
              );
            } catch (error) {
              handleErrors(error, null, {
                operationType,
                operationName,
                tags,
                message: `Failed to invalidate cache for tags: ${tags.join(
                  ", ",
                )}`,
              });
            }
          });
        }

        if (revalidatePaths.length > 0) {
          for (const path of revalidatePaths) {
            revalidatePath(path);
          }
        }

        if (!effectiveCache) {
          const result = await callback();
          span.setStatus({ code: SpanStatusCode.OK });
          return [null, result] satisfies OperationWrapperResponse<T>;
        }
        // Gerar chave única para o cache
        // const cacheKey = redisClient.generateCacheKey(
        //   `${operationType}:${operationName}`,
        //   tags,
        //   params
        // );

        // span.setAttributes({ "cache.key": cacheKey });
        // // Tentar recuperar do cache
        // const cachedData = await redisClient.get(cacheKey);

        // if (cachedData) {
        //   apiLogger.debug(`Cache HIT para: ${cacheKey}`);
        //   span.setAttribute("cache.hit", true);
        //   span.setStatus({ code: SpanStatusCode.OK }); // OK
        //   return [null, cachedData as T] satisfies OperationWrapperResponse<T>;
        // }

        // apiLogger.debug(`Cache MISS para: ${cacheKey}`);

        // Executar callback e obter dados frescos
        const freshData = await callback();

        // Armazenar no cache
        if (effectiveCache) {
          setImmediate(async () => {
            try {
              // const ttl = revalidate && revalidate > 0 ? revalidate : undefined;
              // await Promise.all([
              //   redisClient.set<T>(cacheKey, freshData, ttl),
              //   redisClient.addToTags(cacheKey, `${operationType}:tag`, tags),
              // ]);
            } catch (error) {
              handleErrors(error, null, {
                operationType,
                operationName,
                tags,
                message: `${operationType} background cache failed`,
              });
            }
          });
        }

        span.setAttribute("cache.hit", false);
        span.setStatus({ code: SpanStatusCode.OK });
        apiLogger.debug(
          `Error in operation Wrapper (${operationType}) (${operationName})`,
        );

        return [null, freshData as T] satisfies OperationWrapperResponse<T>;
      } catch (error: any) {
        span.setAttribute("cache.hit", false);
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message }); // ERROR
        apiLogger.error(
          { stackTrace: error, operationName, operationType },
          "Error in operation Wrapper",
        );
        return [error as Error, null] satisfies OperationWrapperResponse<T>;
      } finally {
        span.setAttribute("execution.ms", performance.now() - start);
        span.end();
      }
    },
  );
}
