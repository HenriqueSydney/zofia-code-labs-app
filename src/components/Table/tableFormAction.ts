"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
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
      throw new AppError(error.message);
    }

    tagsToRevalidate.forEach((tag) => revalidateTag(tag));
    pathsToRevalidate.forEach((path) => revalidatePath(path));
    return "Operação realizada com sucesso";
  } catch (error) {
    handleErrors(error);
    throw error;
  }
}
