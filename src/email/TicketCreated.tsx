import {
  Button,
  Heading,
  Text,
  Section,
  Row,
  Column,
} from "@react-email/components";
import { EmailContainer } from "./components/EmailContainer";
import { EmailStrongTag } from "./components/EmailStrongTag";

type TicketCreatedProps = {
  clientName: string;
  ticketId: string;
  subject: string;
  category: string; // Ex: Bug, Dúvida, Melhoria
  slaPrediction: string; // Ex: "até 24 horas úteis"
  ticketUrl: string;
};

export default function TicketCreated({
  clientName = "Acme Corp",
  ticketId = "#TCK-9921",
  subject = "Erro ao gerar relatório PDF em Safari",
  category = "Bug Report",
  slaPrediction = "8 horas úteis",
  ticketUrl = "https://zofia.com/suporte/9921",
}: TicketCreatedProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Chamado recebido 📨
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{clientName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Sua solicitação foi registrada com sucesso em nossa central de suporte.
        Nossa equipe técnica já foi notificada.
      </Text>

      <Section className="bg-gray-50 rounded p-4 my-6 border border-gray-200">
        <Row className="mb-2">
          <Column>
            <Text className="text-[11px] text-gray-500 uppercase font-bold m-0">
              Protocolo
            </Text>
            <Text className="text-[16px] text-black font-mono font-bold m-0">
              {ticketId}
            </Text>
          </Column>
          <Column align="right">
            <Text className="text-[11px] text-gray-500 uppercase font-bold m-0">
              Tipo
            </Text>
            <Text className="text-[12px] text-black bg-gray-200 px-2 py-0.5 rounded m-0 inline-block">
              {category}
            </Text>
          </Column>
        </Row>

        <Text className="text-[11px] text-gray-500 uppercase font-bold m-0 mt-2">
          Assunto
        </Text>
        <Text className="text-[14px] text-black m-0 mb-4">{subject}</Text>

        <Text className="text-[12px] text-[hsl(270,85%,65%)] font-medium m-0">
          ⏱️ Prazo estimado para primeira resposta:{" "}
          <strong>{slaPrediction}</strong>.
        </Text>
      </Section>

      <Section className="text-center mt-[20px] mb-[20px]">
        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={ticketUrl}
        >
          Acompanhar Chamado
        </Button>
      </Section>
    </EmailContainer>
  );
}
