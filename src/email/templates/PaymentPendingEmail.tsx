import {
  Button,
  Heading,
  Text,
  Section,
  Hr,
  Row,
  Column,
  Img,
} from "@react-email/components";
import { EmailContainer } from "./_components/EmailContainer";
import { EmailStrongTag } from "./_components/EmailStrongTag";

type PaymentMethodType = "card" | "pix" | "boleto";

type PaymentPendingEmailProps = {
  clientName: string;
  invoiceId: string;
  amount: string;
  dueDate: string;
  servicesDescription: string;
  paymentMethodType: PaymentMethodType;
  // card
  paymentLink?: string;
  // pix
  pixQrCodeBase64?: string;
  pixCopyPaste?: string;
  // boleto
  boletoUrl?: string;
};

const METHOD_LABEL: Record<PaymentMethodType, string> = {
  card: "Cartão de Crédito",
  pix: "Pix",
  boleto: "Boleto Bancário",
};

export default function PaymentPendingEmail({
  clientName = "Acme Corp",
  invoiceId = "#FAT-2026-001",
  amount = "R$ 4.500,00",
  dueDate = "30 de Janeiro de 2026",
  servicesDescription = "Desenvolvimento e Manutenção - Sprint 4",
  paymentMethodType = "pix",
  paymentLink,
  pixQrCodeBase64,
  pixCopyPaste,
  boletoUrl,
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
        pagamento via <strong>{METHOD_LABEL[paymentMethodType]}</strong>.
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

      {/* Cartão — botão de checkout hosted */}
      {paymentMethodType === "card" && paymentLink && (
        <Section className="text-center mt-[20px] mb-[32px]">
          <Button
            className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
            href={paymentLink}
          >
            Pagar com Cartão de Crédito
          </Button>
        </Section>
      )}

      {/* Pix — QR code + copia-e-cola */}
      {paymentMethodType === "pix" && (
        <Section className="text-center mt-[20px] mb-[32px]">
          {pixQrCodeBase64 && (
            <Img
              src={`data:image/png;base64,${pixQrCodeBase64}`}
              width="180"
              height="180"
              alt="QR Code Pix"
              className="mx-auto mb-4"
            />
          )}
          {pixCopyPaste && (
            <>
              <Text className="text-[13px] text-gray-500 mb-1">
                Ou copie o código Pix abaixo:
              </Text>
              <Section className="bg-gray-100 rounded px-4 py-3 mx-auto max-w-sm">
                <Text className="text-[11px] text-gray-700 font-mono m-0 break-all">
                  {pixCopyPaste}
                </Text>
              </Section>
            </>
          )}
          {!pixQrCodeBase64 && !pixCopyPaste && (
            <Text className="text-[13px] text-gray-500">
              Os dados para pagamento via Pix não estão disponíveis. Entre em
              contato conosco.
            </Text>
          )}
        </Section>
      )}

      {/* Boleto — botão para voucher hosted */}
      {paymentMethodType === "boleto" && (
        <Section className="text-center mt-[20px] mb-[32px]">
          {boletoUrl ? (
            <Button
              className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
              href={boletoUrl}
            >
              Visualizar Boleto
            </Button>
          ) : (
            <Text className="text-[13px] text-gray-500">
              O boleto está sendo processado e será enviado em breve.
            </Text>
          )}
        </Section>
      )}

      <Text className="text-[13px] text-gray-500 leading-[20px]">
        Nota: A Nota Fiscal (NFS-e) será enviada automaticamente após a
        confirmação do pagamento.
      </Text>
    </EmailContainer>
  );
}
