import { Button, Heading, Text, Section, Hr } from "@react-email/components";
import { EmailContainer } from "./components/EmailContainer";
import { EmailStrongTag } from "./components/EmailStrongTag";

type BlockerReportProps = {
  clientName: string;
  projectName: string;
  blockerTitle: string;
  blockerDescription: string;
  impactDescription: string; // Ex: "Atrasa a entrega da Sprint 2"
  actionRequired: string; // Ex: "Aprovação do Layout"
  ticketUrl: string;
};

export default function BlockerReport({
  clientName = "Acme Corp",
  projectName = "App Mobile V2",
  blockerTitle = "Falta de Credenciais da API de Pagamento",
  blockerDescription = "Nossa equipe de backend não consegue finalizar a integração pois as chaves de API enviadas anteriormente expiraram.",
  impactDescription = "Isso impede o teste final do fluxo de checkout e atrasará a entrega da Sprint em estimadas 48 horas.",
  actionRequired = "Fornecer novas credenciais de Produção e Sandbox.",
  ticketUrl = "https://zofia.com/projetos/impedimentos/123",
}: BlockerReportProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-red-600">
        Projeto Bloqueado 🛑
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{clientName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Informamos que identificamos um <strong>impedimento (blocker)</strong>{" "}
        que está paralisando parte do desenvolvimento do projeto{" "}
        <strong>{projectName}</strong>.
      </Text>

      {/* Card do Bloqueio */}
      <Section className="bg-red-50 rounded p-4 my-6 border border-red-200">
        <Text className="text-[12px] text-red-800 uppercase font-bold m-0 mb-2">
          O que está acontecendo?
        </Text>
        <Text className="text-[14px] font-bold text-black m-0 mb-4">
          {blockerTitle}
        </Text>
        <Text className="text-[13px] text-gray-700 m-0 mb-4 bg-white p-2 rounded border border-red-100">
          {blockerDescription}
        </Text>

        <Hr className="border-red-200 my-3" />

        <Text className="text-[12px] text-red-800 uppercase font-bold m-0 mb-1">
          Ação Necessária da sua parte:
        </Text>
        <Text className="text-[14px] text-black m-0 mb-4">
          {actionRequired}
        </Text>

        <Text className="text-[12px] text-red-800 uppercase font-bold m-0 mb-1">
          Impacto no Prazo:
        </Text>
        <Text className="text-[13px] text-red-600 font-bold m-0">
          ⚠️ {impactDescription}
        </Text>
      </Section>

      <Text className="text-[14px] text-black leading-[24px]">
        Por favor, resolva essa pendência o mais breve possível para retomarmos
        o fluxo normal de trabalho.
      </Text>

      <Section className="text-center mt-[20px] mb-[20px]">
        <Button
          className="bg-red-600 rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={ticketUrl}
        >
          Resolver Impedimento
        </Button>
      </Section>
    </EmailContainer>
  );
}
