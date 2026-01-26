import { makeServiceDefaultBacklogItemsRepository } from "@/repositories/factories/makeServiceDefaultBacklogItemsRepository";
import { makeServiceTypeRepository } from "@/repositories/factories/makeServiceTypeRepository";
import { CreateServiceDefaultBacklogItemUseCase } from "../CreateServiceDefaultBacklogItemUseCase";

let createServiceDefaultBacklogsItemsUseCase: CreateServiceDefaultBacklogItemUseCase;

export function makeCreateServiceDefaultBacklogItemUseCase() {
  if (!createServiceDefaultBacklogsItemsUseCase) {
    const serviceTypeRepository = makeServiceTypeRepository();
    const serviceDefaultBacklogItemsRepository =
      makeServiceDefaultBacklogItemsRepository();
    createServiceDefaultBacklogsItemsUseCase =
      new CreateServiceDefaultBacklogItemUseCase(
        serviceDefaultBacklogItemsRepository,
        serviceTypeRepository,
      );
  }

  return createServiceDefaultBacklogsItemsUseCase;
}
