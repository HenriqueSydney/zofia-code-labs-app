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

type ClientPortalAccessEmailProps = {
  inviteeName: string;
  organizationName: string;
  clientName: string;
  inviteLink: string;
  userEmail: string;
};

export default function ClientPortalAccessEmail({
  inviteeName = "Maria Souza",
  organizationName = "Zofia Code Labs",
  clientName = "Acme Corp",
  inviteLink = "http://localhost:3000/auth/login?callbackUrl=%2Fminhas-empresas",
  userEmail = "contato@acme.com",
}: ClientPortalAccessEmailProps) {
  return (
    <EmailContainer>
      <Preview>
        Seu acesso ao portal de acompanhamento de projetos está pronto.
      </Preview>

      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Portal do cliente disponível
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{inviteeName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Com a formalização do contrato, liberamos seu acesso ao portal para
        acompanhar os projetos de <EmailStrongTag>{clientName}</EmailStrongTag>,
        gerenciados pela <EmailStrongTag>{organizationName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Este acesso é exclusivo para clientes: você poderá visualizar
        cronogramas, entregas, documentos e andamento dos projetos.
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
          href={inviteLink}
        >
          Acessar portal e definir senha
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
        este acesso, pode ignorar este email com segurança.
      </Text>

      <Text className="text-[12px] text-gray-500 leading-[24px] mt-6">
        Por questões de segurança, o link é válido por{" "}
        <span className="text-black">24 horas</span>. Caso expire, solicite um
        novo convite à equipe responsável.
      </Text>
    </EmailContainer>
  );
}
