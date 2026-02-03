// useCases/financial/GetExpensesByCategoryUseCase.ts
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";

interface IRequest {
  organizationId: string;
  userId: string;
}

export class GetExpensesByCategoryUseCase {
  constructor(private statsRepo: IProjectStatsRepository) {}

  async execute({ organizationId }: IRequest) {
    const data = await this.statsRepo.getExpensesByCategory(organizationId);

    // Paleta de cores simples para o gráfico
    const COLORS = [
      "hsl(var(--primary))",
      "hsl(var(--secondary))",
      "hsl(var(--accent))",
      "#f59e0b", // amber
      "#10b981", // emerald
      "#6366f1", // indigo
    ];

    return data.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length], // Atribui cor ciclicamente
    }));
  }
}
