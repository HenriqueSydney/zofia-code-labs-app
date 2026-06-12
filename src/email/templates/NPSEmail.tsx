import {
  Button,
  Heading,
  Text,
  Section,
  Row,
  Column,
} from "@react-email/components";
import { EmailContainer } from "./_components/EmailContainer";
import { EmailStrongTag } from "./_components/EmailStrongTag";

type NPSEmailProps = {
  clientName: string;
  triggerEvent: string; // ex: "após a entrega da Sprint 4"
  surveyUrl: string; // Link base para a pesquisa
};

export default function NPSEmail({
  clientName = "Henrique",
  triggerEvent = "a entrega do Módulo Financeiro",
  surveyUrl = "https://zofia.com/feedback/nps/123",
}: NPSEmailProps) {
  return (
    <EmailContainer>
      <Heading className="mx-0 mt-[30px] mb-[10px] p-0 text-center font-normal text-[24px] text-black">
        Como foi sua experiência? 🌟
      </Heading>

      <Text className="text-[14px] text-black leading-[24px] text-center">
        Olá, <EmailStrongTag>{clientName}</EmailStrongTag>.
      </Text>

      <Text className="text-[14px] text-black leading-[24px] text-center">
        Gostaríamos muito de saber sua opinião sobre{" "}
        <strong>{triggerEvent}</strong>. Seu feedback nos ajuda a melhorar a
        cada dia.
      </Text>

      <Text className="text-[16px] font-bold text-center mt-6 mb-4 text-gray-800">
        Acesse nossa plataforma e nos avalie. É rápido e prático.
      </Text>

      <Section className="text-center my-6">
        <Button
          href={`${surveyUrl}`}
          className="bg-[hsl(270,85%,65%)] rounded text-white text-[12px] font-semibold no-underline text-center px-8 py-3"
        >
          Acessar plataforma
        </Button>
      </Section>

      <Text className="text-[12px] text-gray-500 text-center leading-[20px] mt-6">
        A pesquisa leva menos de 1 minuto.
      </Text>
    </EmailContainer>
  );
}
