import { Button, Heading, Text, Section, Hr } from "@react-email/components";
import { EmailContainer } from "./_components/EmailContainer";
import { EmailStrongTag } from "./_components/EmailStrongTag";

type ProjectHandoverProps = {
  clientName: string;
  projectName: string;
  deliveryDate: string;
  repoLink: string;
  docsLink: string;
  warrantyPeriod: string; // Ex: "90 dias"
};

export default function ProjectHandover({
  clientName = "Acme Corp",
  projectName = "Sistema de Gestão ERP",
  deliveryDate = "26/01/2026",
  repoLink = "https://github.com/acme/repo",
  docsLink = "https://docs.zofia.com/acme",
  warrantyPeriod = "90 dias",
}: ProjectHandoverProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Projeto Entregue! 🏆
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Parabéns, <EmailStrongTag>{clientName}</EmailStrongTag>!
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        É com grande orgulho que oficializamos a entrega final do projeto{" "}
        <strong>{projectName}</strong>. Todos os requisitos foram cumpridos e a
        solução está pronta para produção.
      </Text>

      {/* Card de Entregáveis */}
      <Section className="bg-green-50 rounded p-4 my-6 border border-green-200">
        <Text className="text-[12px] text-green-800 uppercase font-bold m-0 mb-3">
          Seus Ativos Digitais
        </Text>

        <Text className="text-[14px] text-black m-0 mb-2">
          📦 <strong>Código Fonte:</strong>{" "}
          <a href={repoLink} className="text-green-700 underline">
            Acessar Repositório
          </a>
        </Text>
        <Text className="text-[14px] text-black m-0 mb-2">
          📚 <strong>Documentação Técnica:</strong>{" "}
          <a href={docsLink} className="text-green-700 underline">
            Ler Manual
          </a>
        </Text>
        <Text className="text-[14px] text-black m-0">
          📅 <strong>Data de Entrega:</strong> {deliveryDate}
        </Text>
      </Section>

      <Text className="text-[13px] text-gray-600 leading-[20px]">
        <strong>Garantia Técnica:</strong> Conforme contrato, você tem um
        período de garantia de <strong>{warrantyPeriod}</strong> para correções
        de bugs (sem custo adicional) a partir de hoje.
      </Text>

      <Section className="text-center mt-[30px] mb-[20px]">
        <Button
          className="bg-green-700 rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={repoLink}
        >
          Confirmar Recebimento
        </Button>
      </Section>
    </EmailContainer>
  );
}
