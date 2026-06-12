import { Hr, Text } from "@react-email/components";

export function EmailFooter() {
  return (
    <>
      <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
      <Text className="text-[12px] text-[hsl(270,85%,65%)] leading-[20px] text-center mt-10">
        © {new Date().getFullYear()} Zofia Code Labs — Todos os direitos
        reservados.
      </Text>
    </>
  );
}
