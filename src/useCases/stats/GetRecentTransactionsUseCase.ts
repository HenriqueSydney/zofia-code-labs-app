// useCases/financial/GetRecentTransactionsUseCase.ts
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";

interface IRequest {
  organizationId: string;
  userId: string;
  limit?: number;
}

export class GetRecentTransactionsUseCase {
  constructor(private statsRepo: IProjectStatsRepository) {}

  async execute({ organizationId, limit = 20 }: IRequest) {
    const transactions = await this.statsRepo.getRecentTransactions(
      organizationId,
      limit,
    );

    // Retornamos os dados. A formatação de data/moeda pode ser feita aqui
    // ou no componente "client" para evitar problemas de hidratação com timezone.
    return transactions.map((t) => ({
      ...t,
      // Opcional: formatar valores aqui se quiser enviar strings prontas
      // formattedAmount: formatCurrency(t.amount)
    }));
  }
}
