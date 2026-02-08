import { StatsCardContainer } from "./_components/StatsCardContainer";
import { DeliveryEvolutionChart } from "./_components/DeliveryEvolutionChart";
import { BlockerContainer } from "./_components/BlockersContainer";
import { ProjectPipelineChart } from "./_components/ProjectPipelineChart";
import { ClientProjectTable } from "./_components/ClientProjectTable";
import { ClientProjectTableContainer } from "./_components/ClientProjectTableContainer";

interface IPageParams {
  params: Promise<{ client: string }>;
}

export default async function ClientMacroDashboard({ params }: IPageParams) {
  const { client: slug } = await params;

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <StatsCardContainer slug={slug} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Evolução de Entregas */}
        <div className="col-span-2">
          <DeliveryEvolutionChart slug={slug} />
        </div>

        {/* Componente: Aguardando Definição (Blockers) */}
        <BlockerContainer slug={slug} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Pizza: Pipeline */}
        <ProjectPipelineChart slug={slug} />
        <div className="col-span-2">
          <ClientProjectTableContainer slug={slug} />
        </div>
        {/* Calendário de Entregas */}

        {/* <Card className="h-[530px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Calendário de Entregas
            </CardTitle>
            <CardDescription>Previsão de Sprints e reuniões.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              className="rounded-md border shadow w-full max-w-sm"
            />
          </CardContent>
        </Card>

        <ClientsProjectsctivityLog /> */}
      </div>

      {/* Tabela de Projetos */}
    </div>
  );
}
