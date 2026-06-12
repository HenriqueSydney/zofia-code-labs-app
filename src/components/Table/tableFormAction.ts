"use server";

import { resolveActionErrorMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { revalidatePath, revalidateTag } from "next/cache";

import { ValidationError } from "@/errors";
import { httpClient } from "@/lib/httpClient";

interface ITableFormAction {
  endPoint: string;
  values: string[];
  tagsToRevalidate?: string[];
  pathsToRevalidate?: string[];
  method?: "POST" | "PUT" | "DELETE" | "PATCH";
}

export async function tableFormAction({
  endPoint,
  values,
  pathsToRevalidate = [],
  tagsToRevalidate = [],
  method,
}: ITableFormAction) {
  try {
    const [error, success] = await httpClient(endPoint, {
      method,
      body: JSON.stringify({ data: values }),
    });

    if (error) {
      throw new ValidationError(error.message);
    }

    tagsToRevalidate.forEach((tag) => revalidateTag(tag, "layout"));
    pathsToRevalidate.forEach((path) => revalidatePath(path));
    return "Operação realizada com sucesso";
  } catch (error) {
    await resolveActionErrorMessage(error);
    throw error;
  }
}
