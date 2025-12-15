"use server";

import { makeFetchServiceUseCase } from "@/useCases/services/factories/makeFetchServiceTypeUseCase";

export async function fetchServiceTypeAction(query?: string) {
  const fetchServiceTypeUseCase = makeFetchServiceUseCase();

  const serviceTypes = await fetchServiceTypeUseCase.execute({ query });

  return serviceTypes;
}
