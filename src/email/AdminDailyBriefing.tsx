import {
  Button,
  Heading,
  Text,
  Section,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import { EmailContainer } from "./components/EmailContainer";

type ProjectItem = {
  name: string;
  client: string;
  date: string; // Data de início ou fim
};

type DailyBriefingProps = {
  date: string;
  revenueToday: string;
  activeUsers: number;
  criticalTickets: number;
  pendingContracts: number;
  todaysAgenda: string[];
  projectsStartingSoon: ProjectItem[];
  projectsEndingSoon: ProjectItem[];
};

export default function AdminDailyBriefing({
  date = "26 de Janeiro, 2026",
  revenueToday = "R$ 12.500",
  activeUsers = 342,
  criticalTickets = 2,
  pendingContracts = 1,
  todaysAgenda = [
    "09:00 - Daily com Time de Dev",
    "14:00 - Reunião de Kick-off com Acme Corp",
    "16:30 - Review de Código (PR #45)",
  ],
  projectsStartingSoon = [
    { name: "App de Delivery V2", client: "FastFood Inc", date: "Amanhã" },
    { name: "Integração SAP", client: "Logística 360", date: "Em 3 dias" },
  ],
  projectsEndingSoon = [
    { name: "Portal do Colaborador", client: "RH Tech", date: "Hoje" },
    { name: "Landing Page Black Friday", client: "E-Shop", date: "Em 2 dias" },
  ],
}: DailyBriefingProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[4px] p-0 text-center font-normal text-[24px] text-black">
        Bom dia, Henrique ☕
      </Heading>
      <Text className="text-[12px] text-gray-500 text-center m-0 mb-6 uppercase tracking-widest">
        Resumo Executivo • {date}
      </Text>

      {/* Dashboard Grid - KPIs */}
      <Section className="mb-6">
        <Row>
          <Column className="w-1/2 p-1">
            <div className="bg-purple-50 p-3 rounded border border-purple-100 text-center">
              <Text className="text-[20px] font-bold text-purple-700 m-0">
                {revenueToday}
              </Text>
              <Text className="text-[10px] uppercase text-purple-900 m-0">
                Faturamento (Mês)
              </Text>
            </div>
          </Column>
          <Column className="w-1/2 p-1">
            <div className="bg-blue-50 p-3 rounded border border-blue-100 text-center">
              <Text className="text-[20px] font-bold text-blue-700 m-0">
                {activeUsers}
              </Text>
              <Text className="text-[10px] uppercase text-blue-900 m-0">
                Usuários Ativos
              </Text>
            </div>
          </Column>
        </Row>
        <Row>
          <Column className="w-1/2 p-1">
            <div className="bg-red-50 p-3 rounded border border-red-100 text-center">
              <Text className="text-[20px] font-bold text-red-700 m-0">
                {criticalTickets}
              </Text>
              <Text className="text-[10px] uppercase text-red-900 m-0">
                Chamados Críticos
              </Text>
            </div>
          </Column>
          <Column className="w-1/2 p-1">
            <div className="bg-amber-50 p-3 rounded border border-amber-100 text-center">
              <Text className="text-[20px] font-bold text-amber-700 m-0">
                {pendingContracts}
              </Text>
              <Text className="text-[10px] uppercase text-amber-900 m-0">
                Contratos Pendentes
              </Text>
            </div>
          </Column>
        </Row>
      </Section>

      <Hr className="border-gray-100 my-4" />

      {/* Seção: Radar de Projetos */}
      <Section className="mb-6">
        <Text className="text-[12px] uppercase font-bold text-gray-500 mb-3">
          Radar de Projetos
        </Text>

        <Row>
          {/* Coluna: Iniciando (Verde) */}
          <Column className="w-1/2 align-top pr-2">
            <div className="bg-green-50 rounded p-2 border border-green-100 h-full">
              <Text className="text-[11px] font-bold text-green-800 m-0 mb-2 uppercase">
                🚀 Iniciando
              </Text>
              {projectsStartingSoon.length > 0 ? (
                projectsStartingSoon.map((p, i) => (
                  <div key={i} className="mb-2 ">
                    <Text className="text-[12px] font-bold text-green-900 m-0 leading-tight">
                      {p.name}
                    </Text>
                    <Text className="text-[11px] text-green-700 m-0">
                      {p.client} • {p.date}
                    </Text>
                  </div>
                ))
              ) : (
                <Text className="text-[11px] text-gray-400 italic m-0">
                  Nada previsto.
                </Text>
              )}
            </div>
          </Column>

          {/* Coluna: Encerrando (Laranja/Atenção) */}
          <Column className="w-1/2 align-top pl-2">
            <div className="bg-orange-50 rounded p-2 border border-orange-100 h-full">
              <Text className="text-[11px] font-bold text-orange-800 m-0 mb-2 uppercase">
                🏁 Prazo Final
              </Text>
              {projectsEndingSoon.length > 0 ? (
                projectsEndingSoon.map((p, i) => (
                  <div key={i} className="mb-2 ">
                    <Text className="text-[12px] font-bold text-orange-900 m-0 leading-tight">
                      {p.name}
                    </Text>
                    <Text className="text-[11px] text-orange-700 m-0">
                      {p.client} • {p.date}
                    </Text>
                  </div>
                ))
              ) : (
                <Text className="text-[11px] text-gray-400 italic m-0">
                  Tudo tranquilo.
                </Text>
              )}
            </div>
          </Column>
        </Row>
      </Section>

      <Hr className="border-gray-100 my-4" />

      {/* Agenda do Dia */}
      <Section>
        <Text className="text-[12px] uppercase font-bold text-gray-500 mb-3">
          Sua Agenda Hoje
        </Text>
        {todaysAgenda.map((item, i) => (
          <Text
            key={i}
            className="text-[13px] text-black border-l-2 border-[hsl(270,85%,65%)] pl-3 my-2"
          >
            {item}
          </Text>
        ))}
      </Section>

      <Section className="text-center mt-[20px] mb-[20px]">
        <Button
          className="bg-black rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href="https://zofia.com/admin"
        >
          Acessar Admin Dashboard
        </Button>
      </Section>
    </EmailContainer>
  );
}
