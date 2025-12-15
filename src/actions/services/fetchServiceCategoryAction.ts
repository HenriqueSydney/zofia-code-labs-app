"use server";

import { makeFetchServiceUseCase } from "@/useCases/services/factories/makeFetchServiceCategoryUseCase";

export async function fetchServiceCategoryAction(query?: string) {
  const fetchServiceCategoryUseCase = makeFetchServiceUseCase();

  const serviceCategorys = await fetchServiceCategoryUseCase.execute({ query });

  return serviceCategorys;
}
