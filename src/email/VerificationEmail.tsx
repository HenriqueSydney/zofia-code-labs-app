import { Button, Heading, Text, Section, Hr } from "@react-email/components";
import { EmailContainer } from "./components/EmailContainer";
import { EmailStrongTag } from "./components/EmailStrongTag";

type VerificationEmailProps = {
  validationCode: string;
  magicLink: string;
  userEmail: string;
};

export default function VerificationEmail({
  validationCode = "849021",
  magicLink = "https://zofia.com/auth/verify?token=xyz123",
  userEmail = "henrique@zofiacodelabs.com",
}: VerificationEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Verifique seu login 🔐
      </Heading>

      <Text className="text-[14px] text-black leading-[24px] text-center">
        Recebemos uma tentativa de login para <strong>{userEmail}</strong>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px] text-center">
        Para continuar, insira o código abaixo na tela de verificação:
      </Text>

      {/* Seção do Código - Design de "Cartão" para destaque */}
      <Section className="bg-gray-100 rounded-md my-6 py-4 px-4 mx-auto w-full max-w-[280px] text-center border border-gray-200">
        <Text className="text-[32px] font-bold tracking-[8px] text-gray-800 m-0 font-mono leading-none">
          {validationCode}
        </Text>
      </Section>

      <Text className="text-[14px] text-black leading-[24px] text-center">
        Ou, se preferir, clique no botão para entrar diretamente:
      </Text>

      <Section className="text-center mt-[20px] mb-[32px]">
        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={magicLink}
        >
          Entrar na Zofia Code Labs
        </Button>
      </Section>

      <Text className="text-[12px] text-gray-500 leading-[20px] text-center">
        Este código e link expiram em 10 minutos.
      </Text>

      <Hr className="my-[20px] w-full border border-[#eaeaea]" />

      <Text className="text-[12px] text-gray-400 leading-[20px] text-center">
        Se você não solicitou este código, é possível que alguém tenha digitado
        seu email por engano. Nenhuma ação é necessária.
      </Text>
    </EmailContainer>
  );
}
