import { ExternalServiceError, ResourceNotFoundError } from "@/errors";
// src/services/cep-service.ts

export interface CepResult {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

// Interface da resposta da BrasilAPI
interface BrasilApiResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
}

// Interface da resposta da ViaCEP
interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function fetchAddressByCep(cep: string): Promise<CepResult> {
  const cleanCep = cep.replace(/\D/g, "");

  if (cleanCep.length !== 8) {
    throw new ExternalServiceError("CEP inválido");
  }

  // 1. Definição da busca na BrasilAPI
  const brasilApiPromise = fetch(
    `https://brasilapi.com.br/api/cep/v1/${cleanCep}`,
  ).then(async (res) => {
    if (!res.ok) throw new ExternalServiceError("CEP", "BrasilAPI Error");
    const data = (await res.json()) as BrasilApiResponse;
    return {
      street: data.street,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
    };
  });

  // 2. Definição da busca na ViaCEP
  const viaCepPromise = fetch(
    `https://viacep.com.br/ws/${cleanCep}/json/`,
  ).then(async (res) => {
    if (!res.ok) throw new ExternalServiceError("CEP", "ViaCEP Error");
    const data = (await res.json()) as ViaCepResponse;
    if (data.erro) throw new ResourceNotFoundError("ViaCEP Not Found");
    return {
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
    };
  });

  try {
    // 3. Promise.any pega o primeiro SUCESSO. Se um falhar, ele espera o outro.
    const result = await Promise.any([brasilApiPromise, viaCepPromise]);
    return result;
  } catch (error) {
    // AggregateError acontece se TODOS falharem
    throw new ResourceNotFoundError("CEP não encontrado em nenhum serviço.");
  }
}
