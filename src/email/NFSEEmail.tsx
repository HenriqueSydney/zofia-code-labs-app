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

type NFSEEmailProps = {
  clientName: string;
  nfsNumber: string;
  verificationCode: string;
  issueDate: string;
  pdfUrl: string;
  xmlUrl: string;
  competence: string; // Mês de competência
};

export default function NFSEEmail({
  clientName = "Acme Corp",
  nfsNumber = "2026000156",
  verificationCode = "X9J-2K1-L90",
  issueDate = "25/01/2026",
  pdfUrl = "https://zofia.com/nfs/pdf/123",
  xmlUrl = "https://zofia.com/nfs/xml/123",
  competence = "Janeiro/2026",
}: NFSEEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Nota Fiscal Emitida 🏛️
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{clientName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        A Nota Fiscal de Serviços Eletrônica (NFS-e) referente à competência de{" "}
        <strong>{competence}</strong> foi emitida com sucesso.
      </Text>

      {/* Dados da Nota - Visual mais técnico */}
      <Section className="bg-gray-100 rounded p-4 my-6 border border-gray-200">
        <Row className="mb-2">
          <Column>
            <Text className="text-[12px] text-gray-500 uppercase font-bold m-0">
              Número da Nota
            </Text>
            <Text className="text-[16px] text-black font-mono font-bold m-0">
              {nfsNumber}
            </Text>
          </Column>
          <Column align="right">
            <Text className="text-[12px] text-gray-500 uppercase font-bold m-0">
              Emissão
            </Text>
            <Text className="text-[14px] text-black m-0">{issueDate}</Text>
          </Column>
        </Row>
        <Text className="text-[12px] text-gray-500 uppercase font-bold m-0">
          Código de Verificação
        </Text>
        <Text className="text-[14px] text-black font-mono m-0">
          {verificationCode}
        </Text>
      </Section>

      <Section className="text-center mt-[20px] mb-[32px]">
        <Row className="mb-4">
          <Button
            className="bg-gray-800 rounded text-white text-[12px] font-semibold no-underline text-center px-6 py-3"
            href={pdfUrl}
          >
            Baixar PDF (Visualizar)
          </Button>
        </Row>
        <Row>
          <Button
            className="bg-gray-200 rounded text-gray-800 text-[12px] font-semibold no-underline text-center px-6 py-3 border border-gray-300"
            href={xmlUrl}
          >
            Baixar XML (Contábil)
          </Button>
        </Row>
      </Section>

      <Text className="text-[13px] text-gray-500 leading-[20px] text-center">
        Este documento é indispensável para a escrituração contábil e fiscal da
        sua empresa. Encaminhe este email para o seu departamento financeiro.
      </Text>
    </EmailContainer>
  );
}
