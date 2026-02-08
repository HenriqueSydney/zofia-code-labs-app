import { getClientAction } from "@/actions/clients/getClientAction";
import { AppError } from "@/errors/AppError";
import { operationWrapper } from "@/lib/operationWrapper";
import { cache } from "react";

export const getClientData = cache(async (slug: string) => {
  const [error, success] = await operationWrapper("action", "getClient", () =>
    getClientAction(slug),
  );

  if (error) {
    throw new AppError(error.message);
  }

  const client = success.client;

  if (!client) {
    throw new AppError("Cliente não localizado");
  }
  
  return client;
});
