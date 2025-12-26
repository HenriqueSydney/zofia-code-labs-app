import { makeContractRepository } from "@/repositories/factories/makeContractRepository";
import { makeBankingService } from "@/services/payment/banking/makeBankingService";

// No seu arquivo de Webhook ou UseCase de Assinatura:
export async function triggerDigitalBankIntegration(contractId: string) {
  const contractRepository = makeContractRepository();

  const contract = await contractRepository.findById(contractId);

  if (!contract) return;

  const bankingService = makeBankingService();

  const amout = Math.round(contract.proposal.totalValue.toNumber() * 100);

  const invoice = await bankingService.createInvoice({
    amount: amout, // Ex: R$ 1.500,00 (em centavos)
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
    customer: {
      name: contract.project.client.tradeName,
      document: "00000000000000", // CPF/CNPJ do cliente no banco
      email: contract.project.client.email,
    },
    description: `Pagamento Ref. Contrato #${contract.id}`,
  });

  //ATUALIZAR O INVOICE

  // Salvar o providerId no banco para conciliação futura
  //   await contractRepository.update(contractId, {
  //     status:''
  //   });
}
