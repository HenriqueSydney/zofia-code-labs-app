import { makeServiceDefaultBacklogItemsRepository } from "@/repositories/factories/makeServiceDefaultBacklogItemsRepository";
import { makeServiceTypeRepository } from "@/repositories/factories/makeServiceTypeRepository";
import { ListServiceDefaultBacklogsItemsUseCase } from "../ListServiceDefaultBacklogsItemsUseCase";

let listServiceDefaultBacklogsItemsUseCase: ListServiceDefaultBacklogsItemsUseCase;

export function makeListServiceDefaultBacklogsItemsUseCase() {
  if (!listServiceDefaultBacklogsItemsUseCase) {
    const serviceTypeRepository = makeServiceTypeRepository();
    const serviceDefaultBacklogItemsRepository =
      makeServiceDefaultBacklogItemsRepository();
    listServiceDefaultBacklogsItemsUseCase =
      new ListServiceDefaultBacklogsItemsUseCase(
        serviceTypeRepository,
        serviceDefaultBacklogItemsRepository,
      );
  }

  return listServiceDefaultBacklogsItemsUseCase;
}
