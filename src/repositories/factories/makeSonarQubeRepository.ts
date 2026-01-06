import { ISonarQubeRepository } from "../ISonarQubeRepository";
import { PrismaSonarQubeRepository } from "../prisma/PrismaSonarQubeRepository";

let sonarQubeRepo: ISonarQubeRepository | null = null;

export function makeSonarQubeRepository() {
  if (!sonarQubeRepo) {
    sonarQubeRepo = new PrismaSonarQubeRepository();
  }
  return sonarQubeRepo;
}
