import { Img, Section } from "@react-email/components";
const BASE_URL = "http://localhost:3000";

export function EmailHeader() {
  return (
    <Section className="mt-[32px]">
      <Img
        src={`${BASE_URL}/zofia-logo.webp`}
        width="150"
        height="auto"
        alt="Zofia Code Labs Logo"
        className="mx-auto my-0"
      />
    </Section>
  );
}
