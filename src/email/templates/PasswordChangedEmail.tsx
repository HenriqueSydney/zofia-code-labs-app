import { Button, Heading, Section, Text, Hr } from "@react-email/components";
import { EmailContainer } from "./_components/EmailContainer";
import { EmailStrongTag } from "./_components/EmailStrongTag";

type PasswordChangedEmailProps = {
  userName: string;
  userEmail: string;
  date: string;
  deviceInfo: string;
  ipAddress: string;
  resetLink: string;
};

export default function PasswordChangedEmail({
  userName = "Henrique Lima",
  userEmail = "henrique@zofiacodelabs.com",
  date = "25 de Janeiro de 2026 às 14:30",
  deviceInfo = "Chrome no Windows 11",
  ipAddress = "192.168.1.1",
  resetLink = "http://localhost:3000/auth/recover",
}: PasswordChangedEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Senha alterada com sucesso 🔒
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{userName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        A senha da sua conta Zofia Code Labs associada ao email{" "}
        <strong>{userEmail}</strong> foi alterada recentemente.
      </Text>

      {/* Box de Informações de Segurança - Fundamental para auditoria */}
      <Section className="bg-gray-50 rounded p-4 my-6 border border-gray-100">
        <Text className="text-[12px] text-gray-500 uppercase font-bold m-0 mb-3">
          Detalhes da alteração:
        </Text>
        <Text className="text-[13px] text-black m-0 mb-1">
          <strong>📅 Quando: </strong> {date}
        </Text>
        <Text className="text-[13px] text-black m-0 mb-1">
          <strong>💻 Dispositivo: </strong> {deviceInfo}
        </Text>
        <Text className="text-[13px] text-black m-0">
          <strong>🌐 Endereço IP: </strong> {ipAddress}
        </Text>
      </Section>

      <Text className="text-[14px] text-black leading-[24px]">
        Se foi você quem realizou essa alteração, pode ignorar este email com
        segurança.
      </Text>

      <Hr className="mx-0 my-[20px] w-full border border-[#eaeaea] border-solid" />

      {/* Seção de Alerta Vermelho */}
      <Text className="text-[14px] text-black leading-[24px] font-bold">
        Não foi você?
      </Text>
      <Text className="text-[14px] text-black leading-[24px]">
        Isso pode indicar que alguém acessou sua conta indevidamente.
        Recomendamos que você redefina sua senha imediatamente para proteger
        seus dados.
      </Text>

      <Section className="text-center mt-[20px] mb-[20px]">
        {/* Botão com cor de alerta (vermelho/laranja) para diferenciar da ação positiva */}
        <Button
          className="bg-red-500 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
          href={resetLink}
        >
          Recuperar minha conta
        </Button>
      </Section>
    </EmailContainer>
  );
}
