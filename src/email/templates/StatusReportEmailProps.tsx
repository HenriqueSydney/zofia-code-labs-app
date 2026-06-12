import {
  Button,
  Heading,
  Text,
  Section,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import { EmailContainer } from "./_components/EmailContainer";
import { EmailStrongTag } from "./_components/EmailStrongTag";

type StatusReportEmailProps = {
  clientName: string;
  projectName: string;
  weekRange: string; // ex: "20 Jan - 26 Jan"
  completedTasks: string[];
  inProgressTasks: string[];
  nextSteps: string[];
  reportUrl: string;
};

export default function StatusReportEmail({
  clientName = "Acme Corp",
  projectName = "Portal do Colaborador",
  weekRange = "20/01 a 26/01",
  completedTasks = [
    "Configuração do Ambiente Staging",
    "Modelagem do Banco de Dados",
    "Login com Google",
  ],
  inProgressTasks = [
    "Desenvolvimento do Dashboard",
    "Integração com Gateway de Pagamento",
  ],
  nextSteps = ["Início dos testes de carga", "Validação de UX"],
  reportUrl = "https://zofia.com/projetos/report/123",
}: StatusReportEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Status Report Semanal 📊
      </Heading>

      <Text className="text-[14px] text-gray-500 text-center uppercase tracking-wider text-[10px] mb-4">
        Período: {weekRange}
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{clientName}</EmailStrongTag>. Confira o resumo do
        progresso no projeto <strong>{projectName}</strong> nesta semana.
      </Text>

      {/* Seção: O que foi entregue */}
      <Section className="mt-6">
        <Text className="text-[14px] font-bold text-[hsl(270,85%,65%)] m-0 mb-2 uppercase">
          ✅ Concluído esta semana
        </Text>
        <ul className="m-0 p-0 pl-4 list-disc text-[14px] text-gray-700 leading-[24px]">
          {completedTasks.map((item, index) => (
            <li key={index} className="mb-1">
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Hr className="my-4 border-gray-100" />

      {/* Seção: Em andamento */}
      <Section>
        <Text className="text-[14px] font-bold text-blue-600 m-0 mb-2 uppercase">
          🔄 Em andamento
        </Text>
        <ul className="m-0 p-0 pl-4 list-disc text-[14px] text-gray-700 leading-[24px]">
          {inProgressTasks.map((item, index) => (
            <li key={index} className="mb-1">
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Hr className="my-4 border-gray-100" />

      {/* Seção: Próximos Passos */}
      <Section className="bg-gray-50 p-4 rounded mb-6">
        <Text className="text-[12px] font-bold text-gray-500 m-0 mb-2 uppercase">
          Próximos Passos
        </Text>
        <ul className="m-0 p-0 pl-4 list-disc text-[13px] text-gray-600 leading-[20px]">
          {nextSteps.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section className="text-center mt-[20px] mb-[20px]">
        <Button
          className="bg-gray-800 rounded text-white text-[12px] font-semibold no-underline text-center px-6 py-3"
          href={reportUrl}
        >
          Ver Detalhes no Painel
        </Button>
      </Section>
    </EmailContainer>
  );
}
