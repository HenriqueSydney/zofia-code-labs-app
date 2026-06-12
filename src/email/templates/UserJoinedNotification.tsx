import {
  Button,
  Heading,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailContainer } from "./_components/EmailContainer";
import { EmailStrongTag } from "./_components/EmailStrongTag";

type UserJoinedNotificationProps = {
  adminName: string;
  newUserName: string;
  newUserEmail: string;
  teamName: string;
  teamManagementUrl: string;
};

export default function UserJoinedNotification({
  adminName = "Henrique Lima",
  newUserName = "Maria Silva",
  newUserEmail = "maria.silva@acme.com",
  teamName = "Acme Corp",
  teamManagementUrl = "http://localhost:3000/dashboard/settings/team",
}: UserJoinedNotificationProps) {
  return (
    <EmailContainer>
      <Preview>
        {newUserName} aceitou o convite e entrou na equipe {teamName}.
      </Preview>

      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Novo membro na equipe! 🎉
      </Heading>

      <Text className="text-[14px] text-black leading-[24px]">
        Olá, <EmailStrongTag>{adminName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        Ótima notícia! O convite enviado para{" "}
        <EmailStrongTag>{newUserName}</EmailStrongTag> foi aceito com sucesso.
      </Text>

      <Text className="text-[14px] text-black leading-[24px]">
        O usuário já realizou o primeiro acesso e agora faz parte do ambiente da{" "}
        <strong>{teamName}</strong> na plataforma.
      </Text>

      <Section className="bg-gray-50 rounded p-4 my-6 border border-gray-100">
        <Text className="text-[12px] text-gray-500 uppercase font-bold m-0 mb-2">
          Detalhes do usuário
        </Text>
        <Text className="text-[14px] text-black m-0">
          <strong>Nome: </strong> {newUserName}
        </Text>
        <Text className="text-[14px] text-black m-0">
          <strong>Email: </strong>
          <a
            href={`mailto:${newUserEmail}`}
            style={{ color: "#4b5563", textDecoration: "underline" }}
          >
            {newUserEmail}
          </a>
        </Text>
      </Section>

      <Text className="text-[14px] text-black leading-[24px]">
        Se precisar ajustar as permissões de acesso ou visualizar a atividade
        deste usuário, acesse o gerenciamento do time.
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
          href={teamManagementUrl}
        >
          Gerenciar Equipe
        </Button>
      </Section>
    </EmailContainer>
  );
}
