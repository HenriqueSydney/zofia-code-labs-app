"use server";
import { handleErrors } from "@/errors/handleErrors";
import { httpClient } from "@/lib/httpClient";
import { apiLogger } from "@/lib/logger";

type GetRepositoryReadmeParams = {
  full_name: string;
};
const ONE_DAY = 24 * 60 * 60;
export async function getRepositoryReadme({
  full_name,
}: GetRepositoryReadmeParams): Promise<string | null> {
  try {
    const readmeUrl = `https://api.github.com/repos/${full_name}/readme`;
    const [readmeError, readmeFile] = await httpClient<{
      content: string;
      encoding: string;
    }>(readmeUrl, {
      cache: "force-cache",
      next: {
        revalidate: ONE_DAY,
        tags: [`git-repo-readme-${full_name}`],
      },
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    let readmeContent: string | null = null;

    if (!readmeError && readmeFile?.content) {
      const binary = Uint8Array.from(atob(readmeFile.content), (c) =>
        c.charCodeAt(0)
      );
      readmeContent = new TextDecoder("utf-8").decode(binary);
    } else {
      console.warn(`No README for ${full_name}`);
      return null;
    }

    const previewMarkdown = readmeContent.split("## Getting Started")[0];

    return readmeContent;
  } catch (error) {
    handleErrors(error, null, {
      message: `Error to get Readme of ${full_name}`,
    });

    return null;
  }
}
