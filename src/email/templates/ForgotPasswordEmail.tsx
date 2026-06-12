import { Button, Heading, Text, Section, Link } from "@react-email/components";
import { EmailContainer } from "./_components/EmailContainer";
import { EmailStrongTag } from "./_components/EmailStrongTag";

type ForgotPasswordEmailProps = {
  userName: string;
  resetLink: string;
  userEmail: string;
};

export default function ForgotPasswordEmail({
  userName = "Henrique Lima",
  resetLink = "http://localhost:3000/auth/reset-password?token=xyz123",
  userEmail = "henrique@zofiacodelabs.com",
}: ForgotPasswordEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Redefinição de Senha 🔐
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{userName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Recebemos uma solicitação para redefinir a senha da sua conta associada
        ao email <strong>{userEmail}</strong>.
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
          href={resetLink}
        >
          Redefinir Minha Senha
        </Button>
      </Section>

      <Text className="text-[14px] text-black leading-[24px]">
        Ou copie e cole o link abaixo no seu navegador:
      </Text>

      {/* Usando <a> padrão para evitar problemas de parsing, estilizado como link */}
      <Text className="text-[14px] m-0 break-all">
        <a
          href={resetLink}
          style={{ color: "hsl(270,85%,65%)", textDecoration: "underline" }}
        >
          {resetLink}
        </a>
      </Text>

      <Section className="bg-gray-50 rounded p-4 my-6 mt-8 border border-gray-100">
        <Text className="text-[13px] text-gray-600 m-0">
          <strong>⚠️ Atenção:</strong> Este link é válido por{" "}
          <strong>60 minutos</strong>.
        </Text>
        <Text className="text-[13px] text-gray-600 m-0 mt-2">
          Se você não solicitou essa alteração, por favor ignore este email. Sua
          senha atual permanecerá inalterada e sua conta está segura.
        </Text>
      </Section>
    </EmailContainer>
  );
}
