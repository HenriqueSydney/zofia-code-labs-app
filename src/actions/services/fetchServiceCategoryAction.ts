"use server";

import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeFetchServiceUseCase } from "@/useCases/services/factories/makeFetchServiceCategoryUseCase";

export async function fetchServiceCategoryAction(query?: string | null) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new UnauthorizedError("sessionExpired");
  }

  const fetchServiceCategoryUseCase = makeFetchServiceUseCase();

  const serviceCategorys = await fetchServiceCategoryUseCase.execute({
    query,
    organizationId: session.user.organizationId,
    userId: session.user.id,
  });

  return serviceCategorys;
}
