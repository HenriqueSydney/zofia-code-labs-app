import { makeProjectStatsRepository } from "@/repositories/factories/makeProjectStatsRepository";
import { GetBacklogEvolutionUseCase } from "../GetBacklogEvolutionUseCase";

let useCase: GetBacklogEvolutionUseCase;

export function makeGetBacklogEvolutionUseCase() {
  if (!useCase) {
    const projectStatsRepository = makeProjectStatsRepository();
    useCase = new GetBacklogEvolutionUseCase(projectStatsRepository);
  }

  return useCase;
}
