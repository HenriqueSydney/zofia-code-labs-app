import { makeServiceDefaultBacklogItemsRepository } from "@/repositories/factories/makeServiceDefaultBacklogItemsRepository";
import { UpdateServiceDefaultBacklogItemUseCase } from "../UpdateServiceDefaultBacklogItemUseCase";

let updateServiceDefaultBacklogsItemsUseCase: UpdateServiceDefaultBacklogItemUseCase;

export function makeUpdateServiceDefaultBacklogItemUseCase() {
  if (!updateServiceDefaultBacklogsItemsUseCase) {
    const serviceDefaultBacklogItemsRepository =
      makeServiceDefaultBacklogItemsRepository();
    updateServiceDefaultBacklogsItemsUseCase =
      new UpdateServiceDefaultBacklogItemUseCase(
        serviceDefaultBacklogItemsRepository,
      );
  }

  return updateServiceDefaultBacklogsItemsUseCase;
}
