// @/services/payment/implementations/CoraBankingService.ts
import {
  IBankingService,
  CreateInvoiceRequest,
  InvoiceResponse,
} from "../IBankingService";
import { httpClient } from "@/lib/httpClient";
import { AppError } from "@/errors/AppError";

// Tipagem da resposta da Cora baseada na doc V2
interface CoraInvoiceResponse {
  id: string;
  code: string;
  status: string;
  payment_options: {
    bank_slip?: {
      url: string;
      line: string;
      bar_code: string;
    };
    pix?: {
      emv: string;
      image_base64: string;
    };
  };
}

export class CoraBankingService implements IBankingService {
  private readonly baseUrl = process.env.CORA_API_URL;

  async createInvoice(data: CreateInvoiceRequest): Promise<InvoiceResponse> {
    // Payload ajustado para Cora V2 (Boleto + PIX Opcional)
    const coraPayload = {
      code: data.metadata?.contractId || `CTR-${Date.now()}`, // Seu identificador único
      customer: {
        name: data.customer.name,
        document: {
          identity: data.customer.document.replace(/\D/g, ""), // Apenas números
          type: data.customer.document.length > 11 ? "CNPJ" : "CPF",
        },
        email: data.customer.email,
      },
      amount: data.amount, // Valor em centavos
      due_date: data.dueDate.toISOString().split("T")[0],
      services: [
        {
          name: data.description || "Prestação de Serviço",
          amount: data.amount,
        },
      ],
      payment_options: ["BANK_SLIP", "PIX"], // Habilita ambos no mesmo documento
    };

    const [error, response] = await httpClient<CoraInvoiceResponse>(
      `${this.baseUrl}/invoices`,
      {
        method: "POST",
        body: JSON.stringify(coraPayload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CORA_ACCESS_TOKEN}`,
          client_id: process.env.CORA_CLIENT_ID || "",
        },
      }
    );

    if (error) {
      console.error("Erro na Cora API:", error);
      // Aqui usamos o erro retornado pelo seu httpClient
      throw new AppError(
        `Erro Cora: ${error.message || "Falha na comunicação"}`
      );
    }

    // Mapeamos a resposta da Cora para a nossa interface genérica IBankingService
    return {
      providerId: response.id,
      status: "PENDING",
      copyPasteCode: response.payment_options.pix?.emv,
      qrCodeImage: response.payment_options.pix?.image_base64,
      pdfUrl: response.payment_options.bank_slip?.url,
      rawResponse: response,
    };
  }

  async getInvoiceStatus(
    providerId: string
  ): Promise<InvoiceResponse["status"]> {
    const [error, response] = await httpClient<CoraInvoiceResponse>(
      `${this.baseUrl}/invoices/${providerId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.CORA_ACCESS_TOKEN}`,
        },
      }
    );

    if (error) return "PENDING";

    const statusMap: Record<string, InvoiceResponse["status"]> = {
      PAID: "PAID",
      OPEN: "PENDING",
      DUE: "PENDING",
      CANCELLED: "CANCELLED",
      REFUNDED: "CANCELLED",
    };

    return statusMap[response.status] || "PENDING";
  }

  async cancelInvoice(providerId: string): Promise<void> {
    const [error] = await httpClient<{ id: string }>(
      `${this.baseUrl}/invoices/${providerId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CORA_ACCESS_TOKEN}`,
        },
      }
    );

    if (error) throw new AppError("Erro ao cancelar fatura na Cora");
  }
}
