import { ValidationError } from "@/errors";

type ClientWithResponsible = {
  responsibleName?: string | null;
  responsibleEmail?: string | null;
};

export function assertClientHasResponsible(client: ClientWithResponsible): void {
  const name = client.responsibleName?.trim();
  const email = client.responsibleEmail?.trim();

  if (!name || !email) {
    throw new ValidationError("Cadastre o responsável legal (nome e e-mail) do cliente antes de enviar o contrato.", { statusCode: 400 });
  }
}

export function clientHasResponsible(client: ClientWithResponsible): boolean {
  return Boolean(
    client.responsibleName?.trim() && client.responsibleEmail?.trim(),
  );
}
