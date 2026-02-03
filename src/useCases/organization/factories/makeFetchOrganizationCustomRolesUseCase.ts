import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { FetchOrganizationCustomRolesUseCase } from "../FetchOrganizationCustomRolesUseCase";

let fetchOrganizationCustomRolesUseCase: FetchOrganizationCustomRolesUseCase;

export function makeFetchOrganizationCustomRolesUseCase() {
  if (!fetchOrganizationCustomRolesUseCase) {
    const organizationRepository = makeOrganizationRepository();
    fetchOrganizationCustomRolesUseCase =
      new FetchOrganizationCustomRolesUseCase(organizationRepository);
  }

  return fetchOrganizationCustomRolesUseCase;
}
