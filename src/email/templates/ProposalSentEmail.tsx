import { Button, Heading, Text, Section } from "@react-email/components";
import { EmailContainer } from "./_components/EmailContainer";
import { EmailStrongTag } from "./_components/EmailStrongTag";

export type ProposalSentEmailProps = {
  clientName: string;
  projectName: string;
  totalValue: string;
  validUntil: string;
  proposalDownloadUrl?: string;
  senderName?: string;
};

export default function ProposalSentEmail({
  clientName = "Acme Corp",
  projectName = "Desenvolvimento ERP SaaS",
  totalValue = "R$ 45.000,00",
  validUntil = "30 de Janeiro de 2026",
  proposalDownloadUrl = "https://zofia.com/propostas/download/123",
  senderName = "Equipe Comercial Zofia",
}: ProposalSentEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Proposta comercial disponível 📄
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, representante da <EmailStrongTag>{clientName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Segue a proposta comercial referente ao projeto{" "}
        <EmailStrongTag>{projectName}</EmailStrongTag>, aprovada internamente e
        pronta para sua análise.
      </Text>

      <Section className="bg-gray-50 rounded p-4 my-6 border border-gray-100">
        <Text className="text-[14px] text-black m-0 mb-2">
          <strong>Valor total:</strong> {totalValue}
        </Text>
        <Text className="text-[14px] text-black m-0">
          <strong>Válida até:</strong> {validUntil}
        </Text>
      </Section>

      {proposalDownloadUrl ? (
        <Section className="text-center mt-[20px] mb-[20px]">
          <Button
            className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
            href={proposalDownloadUrl}
          >
            Visualizar Proposta (PDF)
          </Button>
        </Section>
      ) : (
        <Text className="text-[14px] text-black leading-[24px]">
          O documento em PDF será disponibilizado em breve pela nossa equipe.
          Caso precise de uma cópia imediata, responda este e-mail.
        </Text>
      )}

      <Text className="text-[14px] text-black leading-[24px]">
        Analise os escopos, prazos e condições de pagamento. Para avançarmos com
        o contrato e o início do desenvolvimento, basta confirmar o aceite pelos
        canais habituais de contato.
      </Text>

      {senderName ? (
        <Text className="text-[14px] text-gray-500 leading-[24px] mt-4">
          Enviado por {senderName}.
        </Text>
      ) : null}

      <Text className="text-[14px] text-gray-500 leading-[24px] mt-4">
        Dúvidas sobre escopo, investimento ou cronograma? Responda este e-mail e
        nossa equipe comercial irá auxiliar.
      </Text>
    </EmailContainer>
  );
}
