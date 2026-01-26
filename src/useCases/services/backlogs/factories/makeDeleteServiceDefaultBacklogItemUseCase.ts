import { makeServiceDefaultBacklogItemsRepository } from "@/repositories/factories/makeServiceDefaultBacklogItemsRepository";
import { DeleteServiceDefaultBacklogItemUseCase } from "../DeleteServiceDefaultBacklogItemUseCase";

let deleteServiceDefaultBacklogsItemsUseCase: DeleteServiceDefaultBacklogItemUseCase;

export function makeDeleteServiceDefaultBacklogItemUseCase() {
  if (!deleteServiceDefaultBacklogsItemsUseCase) {
    const serviceDefaultBacklogItemsRepository =
      makeServiceDefaultBacklogItemsRepository();
    deleteServiceDefaultBacklogsItemsUseCase =
      new DeleteServiceDefaultBacklogItemUseCase(
        serviceDefaultBacklogItemsRepository,
      );
  }

  return deleteServiceDefaultBacklogsItemsUseCase;
}
