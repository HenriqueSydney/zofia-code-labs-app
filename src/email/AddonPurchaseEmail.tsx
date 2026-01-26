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

type AddonPurchaseEmailProps = {
  clientName: string;
  addonName: string;
  addonDescription: string;
  activationDate: string;
  newMonthlyTotal?: string; // Opcional: mostrar o novo valor da mensalidade
  dashboardUrl: string;
};

export default function AddonPurchaseEmail({
  clientName = "Acme Corp",
  addonName = "Módulo de Advanced Analytics 📊",
  addonDescription = "Painéis personalizados de BI, exportação de relatórios em PDF/Excel e métricas de desempenho da equipe em tempo real.",
  activationDate = "Imediata",
  newMonthlyTotal = "R$ 5.200,00",
  dashboardUrl = "https://zofia.com/dashboard/analytics",
}: AddonPurchaseEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Upgrade confirmado! 🚀
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{clientName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Temos o prazer de confirmar a ativação do serviço adicional{" "}
        <EmailStrongTag>{addonName}</EmailStrongTag> em sua conta.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Agora vocês têm acesso a:
        <br />
        <span className="italic text-gray-600">{addonDescription}</span>
      </Text>

      {/* Card de Detalhes da Aquisição */}
      <Section className="bg-purple-50 rounded p-4 my-6 border border-purple-100">
        <Row>
          <Column>
            <Text className="text-[12px] text-purple-800 uppercase font-bold m-0">
              Status
            </Text>
            <Text className="text-[14px] text-black font-medium m-0">
              Ativo
            </Text>
          </Column>
          <Column align="center">
            <Text className="text-[12px] text-purple-800 uppercase font-bold m-0">
              Ativação
            </Text>
            <Text className="text-[14px] text-black m-0">{activationDate}</Text>
          </Column>
          {newMonthlyTotal && (
            <Column align="right">
              <Text className="text-[12px] text-purple-800 uppercase font-bold m-0">
                Nova Mensalidade
              </Text>
              <Text className="text-[14px] text-black font-bold m-0">
                {newMonthlyTotal}
              </Text>
            </Column>
          )}
        </Row>
      </Section>

      <Text className="text-[14px] text-black leading-[24px]">
        Para começar a utilizar os novos recursos, basta acessar o painel
        correspondente na plataforma. Pode ser necessário fazer login novamente
        para que as novas permissões sejam carregadas.
      </Text>

      <Section className="text-center mt-[20px] mb-[32px]">
        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={dashboardUrl}
        >
          Acessar Novos Recursos
        </Button>
      </Section>

      <Hr className="my-[20px] w-full border border-[#eaeaea]" />

      <Text className="text-[13px] text-gray-500 m-0">
        Esta alteração será refletida automaticamente na sua próxima fatura.{" "}
        <br />
        Dúvidas sobre o funcionamento?{" "}
        <a
          href="mailto:suporte@zofiacodelabs.com"
          style={{ color: "hsl(270,85%,65%)", textDecoration: "underline" }}
        >
          Fale com nosso suporte
        </a>
        .
      </Text>
    </EmailContainer>
  );
}
