import { makeOrganizationRepository } from "@/repositories/factories/makeOrganizationRepository";
import { FetchOrganizationMembersUseCase } from "../FetchOrganizationMembersUseCase";

let fetchOrganizationMembersUseCase: FetchOrganizationMembersUseCase;

export function makeFetchOrganizationMembersUseCase() {
  if (!fetchOrganizationMembersUseCase) {
    const organizationRepository = makeOrganizationRepository();
    fetchOrganizationMembersUseCase = new FetchOrganizationMembersUseCase(
      organizationRepository,
    );
  }

  return fetchOrganizationMembersUseCase;
}
