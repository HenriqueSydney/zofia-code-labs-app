import {
  Button,
  Heading,
  Text,
  Section,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import { EmailContainer } from "./_components/EmailContainer";
import { EmailStrongTag } from "./_components/EmailStrongTag";

type AdminPaymentNotificationProps = {
  clientName: string;
  amount: string;
  netAmount: string; // Valor líquido após taxas
  planName: string;
  paymentMethod: string;
  currentMRR: string; // Receita Recorrente Mensal Atualizada
};

export default function AdminPaymentNotification({
  clientName = "Acme Corp",
  amount = "R$ 4.500,00",
  netAmount = "R$ 4.398,50",
  planName = "Plano Enterprise (Mensal)",
  paymentMethod = "Pix",
  currentMRR = "R$ 28.500,00",
}: AdminPaymentNotificationProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-green-700">
        💰 Venda Confirmada!
      </Heading>

      <Text className="text-[14px] text-black text-center mb-6">
        <EmailStrongTag>{clientName}</EmailStrongTag> acabou de pagar.
      </Text>

      {/* Card Financeiro */}
      <Section className="bg-green-50 rounded border border-green-200 p-4">
        <Row className="mb-2">
          <Column>
            <Text className="text-[11px] text-green-800 uppercase font-bold m-0">
              Valor Bruto
            </Text>
            <Text className="text-[18px] text-green-700 font-bold m-0">
              {amount}
            </Text>
          </Column>
          <Column align="right">
            <Text className="text-[11px] text-green-800 uppercase font-bold m-0">
              Valor Líquido
            </Text>
            <Text className="text-[18px] text-green-700 font-bold m-0 opacity-80">
              {netAmount}
            </Text>
          </Column>
        </Row>

        <Hr className="border-green-200 my-2" />

        <Row>
          <Column>
            <Text className="text-[11px] text-green-800 uppercase font-bold m-0">
              Método
            </Text>
            <Text className="text-[13px] text-black m-0">{paymentMethod}</Text>
          </Column>
          <Column align="right">
            <Text className="text-[11px] text-green-800 uppercase font-bold m-0">
              Produto
            </Text>
            <Text className="text-[13px] text-black m-0">{planName}</Text>
          </Column>
        </Row>
      </Section>

      {/* KPI de Negócio */}
      <Section className="mt-4 text-center">
        <Text className="text-[12px] text-gray-500 uppercase font-bold m-0">
          Novo MRR da Zofia
        </Text>
        <Text className="text-[24px] text-black font-bold m-0 tracking-tight">
          {currentMRR} 🚀
        </Text>
      </Section>
    </EmailContainer>
  );
}
