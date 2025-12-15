"use server";

import type { OperationWrapperOptions } from "@/@types/OperationWrapperTypes";
import { operationWrapper } from "./operationWrapper";

type RepositoryClientResponse<T> = [Error, null] | [null, T];

export async function repositoryClient<T>(
  repositoryNameAndMethod: string,
  callback: () => Promise<T>,
  options: OperationWrapperOptions = {}
): Promise<RepositoryClientResponse<T>> {
  return await operationWrapper(
    "repository",
    repositoryNameAndMethod,
    callback,
    options
  );
}
