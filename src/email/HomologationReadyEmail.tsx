import {
  Button,
  Heading,
  Text,
  Section,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import { EmailContainer } from "./components/EmailContainer";
import { EmailStrongTag } from "./components/EmailStrongTag";

type HomologationReadyEmailProps = {
  clientName: string;
  projectName: string;
  featureName: string;
  version: string;
  homologationUrl: string;
  deadlineDate: string;
};

export default function HomologationReadyEmail({
  clientName = "Acme Corp",
  projectName = "Portal do Colaborador",
  featureName = "Módulo de Gestão de Férias (Sprint 4)",
  version = "v1.4.0-rc",
  homologationUrl = "https://staging.zofia.com/projetos/acme/validar/123",
  deadlineDate = "28 de Janeiro de 2026",
}: HomologationReadyEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Entrega pronta para validação 🚀
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, equipe <EmailStrongTag>{clientName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        O desenvolvimento do item <EmailStrongTag>{featureName}</EmailStrongTag>{" "}
        foi concluído e já está implantado em nosso ambiente de testes
        (Staging).
      </Text>

      {/* Card de Detalhes da Entrega */}
      <Section className="bg-gray-50 rounded p-4 my-6 border border-gray-100">
        <Row>
          <Column>
            <Text className="text-[12px] text-gray-500 uppercase font-bold m-0">
              Projeto
            </Text>
            <Text className="text-[14px] text-black font-medium m-0">
              {projectName}
            </Text>
          </Column>
          <Column align="right">
            <Text className="text-[12px] text-gray-500 uppercase font-bold m-0">
              Versão
            </Text>
            <Text className="text-[14px] text-black font-mono m-0 bg-gray-200 px-2 py-0.5 rounded text-[12px]">
              {version}
            </Text>
          </Column>
        </Row>
      </Section>

      <Text className="text-[14px] text-black leading-[24px]">
        Precisamos que você acesse o ambiente, teste as funcionalidades e nos dê
        o seu "De Acordo" para que possamos seguir com o lançamento para
        produção.
      </Text>

      <Section className="text-center mt-[20px] mb-[20px]">
        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={homologationUrl}
        >
          Acessar Ambiente e Aprovar
        </Button>
      </Section>

      <Section className="bg-blue-50 p-4 rounded border border-blue-100">
        <Text className="text-[13px] text-blue-800 m-0 font-medium">
          📅 Prazo sugerido:
        </Text>
        <Text className="text-[13px] text-blue-700 m-0 mt-1">
          Para mantermos o cronograma de deploy em dia, solicitamos a validação
          até <strong>{deadlineDate}</strong>.
        </Text>
      </Section>

      <Hr className="my-[20px] w-full border border-[#eaeaea]" />

      <Text className="text-[13px] text-gray-500 m-0">
        Encontrou algum comportamento inesperado (bug)? <br />
        Você pode reportar diretamente na plataforma clicando em "Rejeitar
        Entrega" no link acima.
      </Text>
    </EmailContainer>
  );
}
