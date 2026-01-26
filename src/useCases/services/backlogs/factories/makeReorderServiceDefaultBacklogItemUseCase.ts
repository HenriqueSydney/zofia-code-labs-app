import { makeServiceDefaultBacklogItemsRepository } from "@/repositories/factories/makeServiceDefaultBacklogItemsRepository";
import { ReorderServiceDefaultBacklogItemUseCase } from "../ReorderServiceDefaultBacklogItemUseCase";

let reorderServiceDefaultBacklogsItemsUseCase: ReorderServiceDefaultBacklogItemUseCase;

export function makeReorderServiceDefaultBacklogsItemsUseCase() {
  if (!reorderServiceDefaultBacklogsItemsUseCase) {
    const serviceDefaultBacklogItemsRepository =
      makeServiceDefaultBacklogItemsRepository();
    reorderServiceDefaultBacklogsItemsUseCase =
      new ReorderServiceDefaultBacklogItemUseCase(
        serviceDefaultBacklogItemsRepository,
      );
  }

  return reorderServiceDefaultBacklogsItemsUseCase;
}
