import {
  Button,
  Heading,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailContainer } from "./_components/EmailContainer";
import { EmailStrongTag } from "./_components/EmailStrongTag";

type InviteUserEmailProps = {
  inviterName: string;
  organizationName: string;
  inviteLink: string;
  userEmail: string;
  role?: string;
};

export default function InviteUserEmail({
  inviterName = "Henrique Lima",
  organizationName = "Acme Corp",
  inviteLink = "http://localhost:3000/auth/invite/accept?token=xyz",
  userEmail = "novo.usuario@acme.com",
  role = "Gestor de Projetos",
}: InviteUserEmailProps) {
  return (
    <EmailContainer>
      {/* Texto invisível que aparece na caixa de entrada antes de abrir o email */}
      <Preview>
        {inviterName} convidou você para colaborar na {organizationName} na
        Zofia Code Labs.
      </Preview>

      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Convite para Colaboração
      </Heading>

      <Text className="text-[14px] text-gray-600 leading-[24px] text-center mb-[30px]">
        Junte-se à equipe da <EmailStrongTag>{organizationName}</EmailStrongTag>
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">Olá!</Text>

      <Text className="text-[14px] text-black leading-[24px]">
        <EmailStrongTag>{inviterName}</EmailStrongTag> convidou você para fazer
        parte do time e acompanhar os projetos de TI gerenciados através da
        nossa plataforma.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Sua função definida será: <strong>{role}</strong>.
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
          href={inviteLink}
        >
          Aceitar Convite e Criar Conta
        </Button>
      </Section>

      <Text className="text-[14px] text-black leading-[24px]">
        Ou copie e cole este URL no seu navegador:
      </Text>
      <Link
        href={inviteLink}
        className="text-[hsl(270,85%,65%)] text-[12px] no-underline break-all"
      >
        {inviteLink}
      </Link>

      <Text className="text-[12px] text-gray-500 leading-[24px] mt-6">
        Este convite foi enviado para{" "}
        <span className="text-black">{userEmail}</span>. Se você não esperava
        por este convite, pode ignorar este email com segurança.
      </Text>

      <Text className="text-[12px] text-gray-500 leading-[24px] mt-6">
        Por questões de segurança, este convite é válido por{" "}
        <span className="text-black">24 horas</span>. Caso não acesse neste
        período, solicite um novo convite.
      </Text>
    </EmailContainer>
  );
}
