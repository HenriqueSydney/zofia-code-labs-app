import { envVariables } from "@/env";
import { handleErrors } from "@/errors/handleErrors";
import { httpClient } from "@/lib/httpClient";
import { apiLogger } from "@/lib/logger";

type TranslateTextWithDeeplParams = {
  content: string;
  tagHandling?: "xml" | "xml" | "xml";
  targetLang?: string;
};

type TranslateTextWithDeeplSuccessResponse = {
  translations: {
    detected_source_language: string;
    text: string;
  }[];
};

export async function translateTextWithDeepl({
  content,
  tagHandling = "xml",
  targetLang = "EN",
}: TranslateTextWithDeeplParams): Promise<string | null> {
  const body = {
    text: [content],
    target_lang: targetLang,
    tag_handling: tagHandling,
  };

  try {
    const [responseError, responseSuccess] =
      await httpClient<TranslateTextWithDeeplSuccessResponse>(
        `${envVariables.DEEPL_API_URL}translate`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            Authorization: `DeepL-Auth-Key ${envVariables.DEEPL_API_KEY}`,
          },
        }
      );

    if (responseError) {
      throw responseError;
    }

    return responseSuccess.translations[0].text;
  } catch (error) {
    handleErrors(error, null, {
      message: "Translation DEEPL error",
    });

    return null;
  }
}
