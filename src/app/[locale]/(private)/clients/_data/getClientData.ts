import { getClientAction } from "@/actions/clients/getClientAction";
import { ValidationError, ResourceNotFoundError } from "@/errors";
import { operationWrapper } from "@/lib/operationWrapper";
import { cache } from "react";

export const getClientData = cache(async (slug: string) => {
  const [error, success] = await operationWrapper("action", "getClient", () =>
    getClientAction(slug),
  );

  if (error) {
    throw new ValidationError(error.message);
  }

  const client = success.client;

  if (!client) {
    throw new ResourceNotFoundError("Cliente não localizado");
  }
  
  return client;
});
