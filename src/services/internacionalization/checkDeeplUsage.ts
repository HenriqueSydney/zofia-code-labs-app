import { envVariables } from "@/env";
import { handleErrors } from "@/errors/handleErrors";
import { httpClient } from "@/lib/httpClient";
import { apiLogger } from "@/lib/logger";

type TranslateTextWithDeeplSuccessResponse = {
  character_count: number;
  character_limit: number;
};

type CheckDeeplUsageResponse = {
  characterCount: number;
  characterLimit: number;
  remainingQuota: number;
};

type ICheckDeeplUsageResponse = [Error, null] | [null, CheckDeeplUsageResponse];

export async function checkDeeplUsage(): Promise<ICheckDeeplUsageResponse> {
  try {
    const [responseError, responseSuccess] =
      await httpClient<TranslateTextWithDeeplSuccessResponse>(
        `${envVariables.DEEPL_API_URL}usage`,
        {
          headers: {
            Authorization: `DeepL-Auth-Key ${envVariables.DEEPL_API_KEY}`,
          },
        }
      );

    if (responseError) {
      throw responseError;
    }

    const remainingQuota =
      responseSuccess.character_limit - responseSuccess.character_count;

    return [
      null,
      {
        characterCount: responseSuccess.character_count,
        characterLimit: responseSuccess.character_limit,
        remainingQuota,
      },
    ];
  } catch (error) {
    handleErrors(error, null, {
      message: "Translation DEEPL error",
    });

    return [error as Error, null];
  }
}
