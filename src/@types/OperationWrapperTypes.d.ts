export interface OperationWrapperOptions {
  cache?: "force-cache" | "no-cache" | "revalidate-tags";
  revalidate?: number | false;
  tags?: string[];
  params?: string;
  revalidateCachedTags?: boolean;
  revalidatePaths?: string[];
}

type OperationWrapperResponse<T> = [Error, null] | [null, T];

export const OPERATION_TYPES = {
  REPOSITORY: "repository",
  NOTION: "notion",
} as const;

export type OperationType =
  (typeof OPERATION_TYPES)[keyof typeof OPERATION_TYPES];
