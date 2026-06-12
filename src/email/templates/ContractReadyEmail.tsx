import { Button, Heading, Text, Section } from "@react-email/components";
import { EmailContainer } from "./_components/EmailContainer";
import { EmailStrongTag } from "./_components/EmailStrongTag";

type ContractReadyEmailProps = {
  clientName: string;
  projectName: string;
  contractUrl: string;
  expirationDate: string;
};

export default function ContractReadyEmail({
  clientName = "Acme Corp",
  projectName = "Desenvolvimento ERP SaaS",
  contractUrl = "https://zofia.com/contratos/assinatura/123",
  expirationDate = "30 de Janeiro de 2026",
}: ContractReadyEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Contrato disponível para assinatura ✍️
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, representante da <EmailStrongTag>{clientName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        O contrato de prestação de serviços referente ao projeto{" "}
        <EmailStrongTag>{projectName}</EmailStrongTag> já foi gerado e está
        disponível para revisão.
      </Text>

      <Section className="bg-gray-50 rounded p-4 my-6 border border-gray-100 text-center">
        <Text className="text-[14px] text-black m-0 mb-4">
          Para garantir o início do desenvolvimento dentro do cronograma, por
          favor, realize a assinatura digital até{" "}
          <strong>{expirationDate}</strong>.
        </Text>

        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={contractUrl}
        >
          Revisar e Assinar Contrato
        </Button>
      </Section>

      <Text className="text-[14px] text-black leading-[24px]">
        O processo é 100% digital e seguro. Após a assinatura, você receberá
        automaticamente uma cópia em PDF com os metadados de assinatura. O
        contrato também estará disponível em nossa plataforma.
      </Text>

      <Text className="text-[14px] text-gray-500 leading-[24px] mt-4">
        Dúvidas sobre alguma cláusula? Responda este email e nossa equipe
        jurídica/comercial irá auxiliar.
      </Text>

      <Text className="text-center text-[12px] text-gray-500 leading-[24px]">
        Utilizamos uma plataforma auto-hospedada da Documenso, especializada em
        assinaturas digitais.
      </Text>
    </EmailContainer>
  );
}
