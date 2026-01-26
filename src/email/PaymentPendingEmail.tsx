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

type PaymentPendingEmailProps = {
  clientName: string;
  invoiceId: string;
  amount: string;
  dueDate: string;
  paymentLink: string;
  servicesDescription: string;
};

export default function PaymentPendingEmail({
  clientName = "Acme Corp",
  invoiceId = "#FAT-2026-001",
  amount = "R$ 4.500,00",
  dueDate = "30 de Janeiro de 2026",
  paymentLink = "https://zofia.com/faturas/pagar/123",
  servicesDescription = "Desenvolvimento e Manutenção - Sprint 4",
}: PaymentPendingEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Nova fatura disponível 📄
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{clientName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        A fatura referente aos serviços de{" "}
        <strong>{servicesDescription}</strong> já está fechada e disponível para
        pagamento.
      </Text>

      {/* Card de Resumo Financeiro */}
      <Section className="bg-gray-50 rounded p-4 my-6 border border-gray-100">
        <Row>
          <Column>
            <Text className="text-[12px] text-gray-500 uppercase font-bold m-0">
              Vencimento
            </Text>
            <Text className="text-[16px] text-black font-semibold m-0">
              {dueDate}
            </Text>
          </Column>
          <Column align="right">
            <Text className="text-[12px] text-gray-500 uppercase font-bold m-0">
              Valor
            </Text>
            <Text className="text-[20px] text-[hsl(270,85%,65%)] font-bold m-0">
              {amount}
            </Text>
          </Column>
        </Row>
        <Hr className="my-3 border-gray-200" />
        <Text className="text-[12px] text-gray-500 m-0">
          Fatura: {invoiceId}
        </Text>
      </Section>

      <Section className="text-center mt-[20px] mb-[32px]">
        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={paymentLink}
        >
          Visualizar Boleto / Pagar
        </Button>
      </Section>

      <Text className="text-[13px] text-gray-500 leading-[20px]">
        Nota: A Nota Fiscal (NFS-e) será enviada automaticamente após a
        confirmação do pagamento.
      </Text>
    </EmailContainer>
  );
}
