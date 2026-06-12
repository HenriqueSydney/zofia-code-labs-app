import { Button, Heading, Text, Section, Hr } from "@react-email/components";
import { EmailContainer } from "./_components/EmailContainer";
import { EmailStrongTag } from "./_components/EmailStrongTag";

type PaymentOverdueEmailProps = {
  clientName: string;
  invoiceId: string;
  amount: string;
  daysOverdue: number;
  paymentLink: string;
};

export default function PaymentOverdueEmail({
  clientName = "Acme Corp",
  invoiceId = "#FAT-2026-001",
  amount = "R$ 4.500,00",
  daysOverdue = 5,
  paymentLink = "https://zofia.com/faturas/pagar/123",
}: PaymentOverdueEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-red-600">
        Pagamento pendente ⚠️
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{clientName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Ainda não identificamos o pagamento da fatura{" "}
        <strong>{invoiceId}</strong>, no valor de <strong>{amount}</strong>.
      </Text>

      {/* Alerta de dias em atraso */}
      <Section className="bg-red-50 rounded p-4 my-6 border border-red-100 text-center">
        <Text className="text-[14px] text-red-800 m-0 font-medium">
          Esta fatura está em atraso há <strong>{daysOverdue} dias</strong>.
        </Text>
        <Text className="text-[12px] text-red-600 m-0 mt-2">
          Evite a suspensão temporária dos serviços e o acréscimo de juros
          regularizando sua pendência hoje.
        </Text>
      </Section>

      <Section className="text-center mt-[20px] mb-[32px]">
        <Button
          className="bg-red-600 rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={paymentLink}
        >
          Pagar Agora e Regularizar
        </Button>
      </Section>

      <Text className="text-[14px] text-black leading-[24px]">
        Caso já tenha efetuado o pagamento nas últimas 24 horas, por favor
        desconsidere este aviso automático.
      </Text>

      <Hr className="my-[20px] w-full border border-[#eaeaea]" />

      <Text className="text-[13px] text-gray-500 m-0">
        Precisa renegociar ou precisa de um novo boleto? <br />
        Responda este email ou entre em contato com nosso financeiro.
      </Text>
    </EmailContainer>
  );
}
