import {
  Button,
  Heading,
  Text,
  Section,
  Row,
  Column,
} from "@react-email/components";
import { EmailContainer } from "./_components/EmailContainer";
import { EmailStrongTag } from "./_components/EmailStrongTag";

type DevStartEmailProps = {
  clientName: string;
  projectName: string;
  startDate: string;
  methodology: string; // Ex: Scrum, Kanban
  pmName: string; // Gerente de Projeto
  boardUrl: string;
};

export default function DevStartEmail({
  clientName = "Acme Corp",
  projectName = "App Mobile de Vendas",
  startDate = "25 de Janeiro de 2026",
  methodology = "Scrum (Sprints de 15 dias)",
  pmName = "Henrique Lima",
  boardUrl = "https://zofia.com/projetos/board/123",
}: DevStartEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Mãos à obra! 🚀
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, equipe <EmailStrongTag>{clientName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        É com satisfação que informamos que a equipe técnica da Zofia Code Labs
        iniciou hoje o desenvolvimento do projeto{" "}
        <EmailStrongTag>{projectName}</EmailStrongTag>.
      </Text>

      {/* Card de Resumo do Kick-off */}
      <Section className="bg-blue-50 rounded p-4 my-6 border border-blue-100">
        <Text className="text-[12px] text-blue-800 uppercase font-bold m-0 mb-3 border-b border-blue-200 pb-2">
          Dados do Projeto
        </Text>

        <Row className="mb-2">
          <Column>
            <Text className="text-[12px] text-gray-500 uppercase font-bold m-0">
              Início
            </Text>
            <Text className="text-[14px] text-black font-medium m-0">
              {startDate}
            </Text>
          </Column>
          <Column align="right">
            <Text className="text-[12px] text-gray-500 uppercase font-bold m-0">
              Metodologia
            </Text>
            <Text className="text-[14px] text-black m-0">{methodology}</Text>
          </Column>
        </Row>

        <Text className="text-[12px] text-gray-500 uppercase font-bold m-0 mt-2">
          Gestor Responsável (Tech Lead)
        </Text>
        <Text className="text-[14px] text-black font-medium m-0">{pmName}</Text>
      </Section>

      <Text className="text-[14px] text-black leading-[24px]">
        Já criamos o quadro de tarefas e o cronograma inicial. Você pode
        acompanhar a evolução de cada item em tempo real através do nosso
        painel.
      </Text>

      <Section className="text-center mt-[20px] mb-[32px]">
        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={boardUrl}
        >
          Acompanhar Board do Projeto
        </Button>
      </Section>

      <Text className="text-[13px] text-gray-500 leading-[20px]">
        <strong>Próximos passos:</strong> Nossa equipe entrará em contato em
        breve para agendar a primeira reunião de acompanhamento (Daily ou
        Review). Fique atento aos canais de comunicação oficiais.
      </Text>
    </EmailContainer>
  );
}
