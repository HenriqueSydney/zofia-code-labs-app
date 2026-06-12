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

type WelcomeClientEmailProps = {
  clientName: string;
  projectName: string;
  userEmail: string;
  actionUrl: string; // URL para definir senha ou login direto
};

export default function WelcomeClientEmail({
  clientName = "Acme Corp",
  projectName = "Desenvolvimento do ERP SaaS",
  userEmail = "contato@acme.com",
  actionUrl = "http://localhost:3000/auth/setup-password?token=xyz",
}: WelcomeClientEmailProps) {
  return (
    <EmailContainer>
      <Preview className="text-[12px] text-gray-600 leading-[20px] text-center mb-2">
        Bem-vindo à Zofia Code Labs! Seu ambiente de projetos está pronto 🚀
      </Preview>

      <Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
        Bem-vindo, <EmailStrongTag>{clientName}</EmailStrongTag>!
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Estamos muito felizes em iniciar essa parceria. Conforme acordado na
        proposta comercial, já preparamos o ambiente exclusivo para o
        gerenciamento do projeto <EmailStrongTag>{projectName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        A partir de agora, você terá total transparência para acompanhar o
        andamento, visualizar cronogramas, aprovar entregas e gerenciar
        pagamentos através do nosso ERP.
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
          href={actionUrl}
        >
          Acessar Plataforma e Definir Senha
        </Button>
      </Section>

      <Text className="text-[14px] text-black leading-[24px]">
        Seus dados de acesso iniciais:
      </Text>

      <Text className="text-[14px] text-black leading-[24px] mt-2">
        <strong>Login: </strong>
        <Link
          href={`mailto:${userEmail}`}
          className="text-[hsl(270,85%,65%)] font-semibold no-underline"
        >
          {userEmail}
        </Link>
      </Text>

      <Text className="text-[14px] text-gray-500 leading-[24px] mt-4">
        * Por segurança, o link acima é válido por 24 horas. Caso expire,
        solicite uma redefinição de senha na tela de login.
      </Text>

      <Text className="text-[14px] text-black leading-[24px] mt-6">
        Se tiver qualquer dúvida durante o primeiro acesso, nossa equipe está à
        disposição.
      </Text>
    </EmailContainer>
  );
}
