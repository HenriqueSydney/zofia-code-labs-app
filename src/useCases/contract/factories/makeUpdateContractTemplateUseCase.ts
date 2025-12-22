import { makeContractRepository } from "@/repositories/factories/makeContractRepository";
import { makeContractTemplateRepository } from "@/repositories/factories/makeContractTemplateRepository";
import { UpdateContractTemplateUseCase } from "../UpdateContractTemplateUseCase";

let updateContractTemplateUseCase: UpdateContractTemplateUseCase;

export function makeUpdateContractTemplateUseCase() {
  if (!updateContractTemplateUseCase) {
    const contractRepository = makeContractRepository();
    const contractTemplateRepository = makeContractTemplateRepository();
    updateContractTemplateUseCase = new UpdateContractTemplateUseCase(
      contractRepository,
      contractTemplateRepository
    );
  }

  return updateContractTemplateUseCase;
}
