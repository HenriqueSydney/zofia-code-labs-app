import { Button, Heading, Text, Section, Hr, Row, Column } from "@react-email/components";
import { EmailContainer } from "./components/EmailContainer";
import { EmailStrongTag } from "./components/EmailStrongTag";

type PaymentReceivedEmailProps = {
  clientName: string;
  amount: string;
  paymentDate: string;
  transactionId: string;
  nextDueDate?: string;
  receiptUrl: string;
};

export default function PaymentReceivedEmail({
  clientName = 'Acme Corp',
  amount = 'R$ 4.500,00',
  paymentDate = '25/01/2026',
  transactionId = 'TX-987654321',
  nextDueDate = '25/02/2026',
  receiptUrl = 'https://zofia.com/faturas/recibo/123',
}: PaymentReceivedEmailProps) {

  return (
    <EmailContainer>
      
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Pagamento confirmado! ✅
      </Heading>
      
      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{clientName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Recebemos o pagamento da sua fatura. Obrigado por manter sua parceria com a Zofia Code Labs.
      </Text>

      {/* Box de Recibo */}
      <Section className="bg-green-50 rounded p-4 my-6 border border-green-100">
        <Row>
          <Column>
            <Text className="text-[12px] text-green-800 uppercase font-bold m-0">Valor Pago</Text>
            <Text className="text-[20px] text-green-700 font-bold m-0">{amount}</Text>
          </Column>
          <Column align="right">
            <Text className="text-[12px] text-green-800 uppercase font-bold m-0">Data</Text>
            <Text className="text-[14px] text-green-900 font-medium m-0">{paymentDate}</Text>
          </Column>
        </Row>
        <Hr className="my-3 border-green-200/50" />
        <Text className="text-[11px] text-green-800 m-0 font-mono">ID: {transactionId}</Text>
      </Section>

      <Section className="text-center mt-[20px] mb-[20px]">
        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={receiptUrl}
        >
          Baixar Comprovante
        </Button>
      </Section>

      <Text className="text-[13px] text-gray-500 leading-[20px] text-center">
        A Nota Fiscal (NFS-e) referente a este pagamento está sendo processada e será enviada em um email separado assim que autorizada pela prefeitura.
      </Text>

      {nextDueDate && (
         <Text className="text-[12px] text-gray-400 text-center mt-4">
           Próximo vencimento estimado: {nextDueDate}
         </Text>
      )}

    </EmailContainer>
  );
}