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

type SLAWarningEmailProps = {
  ticketId: string;
  ticketTitle: string;
  clientName: string;
  timeLeft: string; // ex: "2 horas e 15 minutos"
  deadline: string;
  assignee: string;
  ticketUrl: string;
};

export default function SLAWarningEmail({
  ticketId = "#TCK-854",
  ticketTitle = "Erro crítico na exportação de relatórios PDF",
  clientName = "Acme Corp",
  timeLeft = "4 horas",
  deadline = "25/01/2026 às 18:00",
  assignee = "Henrique Lima",
  ticketUrl = "https://zofia.com/chamados/854",
}: SLAWarningEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-amber-600">
        ⚠️ Atenção: SLA expirando
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{assignee}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        O chamado <strong>{ticketId}</strong> do cliente{" "}
        <strong>{clientName}</strong> está próximo de atingir o limite do Acordo
        de Nível de Serviço (SLA).
      </Text>

      {/* Box de Alerta Amarelo */}
      <Section className="bg-amber-50 rounded p-4 my-6 border border-amber-200">
        <Text className="text-[12px] text-amber-800 uppercase font-bold m-0 mb-2">
          Título do Chamado
        </Text>
        <Text className="text-[15px] text-black font-medium m-0 mb-4">
          {ticketTitle}
        </Text>

        <Hr className="border-amber-200 mb-4" />

        <Row>
          <Column>
            <Text className="text-[12px] text-amber-800 uppercase font-bold m-0">
              Vencimento
            </Text>
            <Text className="text-[14px] text-black m-0">{deadline}</Text>
          </Column>
          <Column align="right">
            <Text className="text-[12px] text-amber-800 uppercase font-bold m-0">
              Tempo Restante
            </Text>
            <Text className="text-[18px] text-amber-600 font-bold m-0">
              {timeLeft}
            </Text>
          </Column>
        </Row>
      </Section>

      <Text className="text-[14px] text-black leading-[24px]">
        Por favor, priorize este atendimento ou escale para a gerência caso haja
        algum impedimento técnico.
      </Text>

      <Section className="text-center mt-[20px] mb-[20px]">
        <Button
          className="bg-amber-600 rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={ticketUrl}
        >
          Ver Chamado Agora
        </Button>
      </Section>
    </EmailContainer>
  );
}
