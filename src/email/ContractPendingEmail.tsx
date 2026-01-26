import { Button, Heading, Text, Section } from "@react-email/components";
import { EmailContainer } from "./components/EmailContainer";
import { EmailStrongTag } from "./components/EmailStrongTag";

type ContractPendingEmailProps = {
  clientName: string;
  projectName: string;
  contractUrl: string;
  daysPending: number; // Quantos dias fazem que o contrato foi enviado
};

export default function ContractPendingEmail({
  clientName = "Acme Corp",
  projectName = "Desenvolvimento ERP SaaS",
  contractUrl = "https://zofia.com/contratos/assinatura/123",
  daysPending = 3,
}: ContractPendingEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Aguardando sua assinatura ⏳
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{clientName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Estamos ansiosos para dar o pontapé inicial no projeto{" "}
        <EmailStrongTag>{projectName}</EmailStrongTag>! 🚀
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Notamos que o contrato enviado há {daysPending} dias ainda consta como
        pendente em nosso sistema.
      </Text>

      {/* Caixa de Aviso "Blocker" */}
      <Section className="bg-orange-50 rounded p-4 my-6 border border-orange-100">
        <Text className="text-[13px] text-gray-700 m-0 font-medium">
          ⚠️ Importante:
        </Text>
        <Text className="text-[13px] text-gray-600 m-0 mt-1">
          Lembramos que a alocação da equipe técnica e o início do cronograma
          dependem da formalização deste documento.
        </Text>
      </Section>

      <Section className="text-center mt-[20px] mb-[20px]">
        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={contractUrl}
        >
          Finalizar Assinatura Agora
        </Button>
      </Section>

      <Text className="text-[14px] text-black leading-[24px]">
        Teve algum problema técnico ou precisa revisar algum termo? Por favor,
        nos avise para não atrasarmos a entrega final.
      </Text>
    </EmailContainer>
  );
}
