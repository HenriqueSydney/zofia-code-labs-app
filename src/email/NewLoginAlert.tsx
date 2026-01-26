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

type NewLoginAlertProps = {
  userName: string;
  userEmail: string;
  loginTime: string;
  ipAddress: string;
  location: string;
  deviceInfo: string; // ex: "Chrome no MacOS"
  secureAccountLink: string;
};

export default function NewLoginAlert({
  userName = "Henrique Lima",
  userEmail = "henrique@zofiacodelabs.com",
  loginTime = "25 de Janeiro, 23:42",
  ipAddress = "201.192.120.44",
  location = "Brasília, Brasil",
  deviceInfo = "Chrome no Windows 11",
  secureAccountLink = "https://zofia.com/auth/security-check",
}: NewLoginAlertProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Novo acesso detectado 🛡️
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{userName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Detectamos um novo login na sua conta <strong>{userEmail}</strong> a
        partir de um dispositivo ou local que não reconhecemos.
      </Text>

      {/* Card de Detalhes do Acesso - Estilo "Terminal" leve */}
      <Section className="bg-gray-50 rounded border border-gray-200 p-4 my-6">
        <Text className="text-[12px] uppercase font-bold text-gray-500 mb-2 border-b border-gray-200 pb-1">
          Detalhes da conexão
        </Text>

        <Row className="mb-1">
          <Column>
            <Text className="text-[13px] text-gray-600 m-0">Quando:</Text>
          </Column>
          <Column align="right">
            <Text className="text-[13px] text-black font-medium m-0">
              {loginTime}
            </Text>
          </Column>
        </Row>
        <Row className="mb-1">
          <Column>
            <Text className="text-[13px] text-gray-600 m-0">Dispositivo:</Text>
          </Column>
          <Column align="right">
            <Text className="text-[13px] text-black font-medium m-0">
              {deviceInfo}
            </Text>
          </Column>
        </Row>
        <Row className="mb-1">
          <Column>
            <Text className="text-[13px] text-gray-600 m-0">Localização:</Text>
          </Column>
          <Column align="right">
            <Text className="text-[13px] text-black font-medium m-0">
              {location}
            </Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text className="text-[13px] text-gray-600 m-0">IP:</Text>
          </Column>
          <Column align="right">
            <Text className="text-[13px] text-black font-medium m-0">
              {ipAddress}
            </Text>
          </Column>
        </Row>
      </Section>

      <Text className="text-[14px] text-black leading-[24px] font-bold">
        Foi você?
      </Text>
      <Text className="text-[14px] text-black leading-[24px] mt-0">
        Se sim, você pode ignorar este email. Este dispositivo será adicionado à
        sua lista de confiança.
      </Text>

      <Text className="text-[14px] text-red-600 leading-[24px] font-bold mt-4">
        Não foi você?
      </Text>
      <Text className="text-[14px] text-black leading-[24px] mt-0">
        Alguém pode ter acesso à sua senha. Recomendamos que você bloqueie o
        acesso e troque sua senha imediatamente.
      </Text>

      <Section className="text-center mt-[20px] mb-[32px]">
        {/* Botão de alerta (Outline vermelho ou fundo vermelho) */}
        <Button
          className="bg-red-500 border border-red-500 text-white rounded text-[12px] font-bold no-underline text-center px-6 py-3"
          href={secureAccountLink}
        >
          Não fui eu (Proteger Conta)
        </Button>
      </Section>
    </EmailContainer>
  );
}
