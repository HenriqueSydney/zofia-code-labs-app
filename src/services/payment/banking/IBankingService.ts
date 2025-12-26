// @/services/payment/IBankingService.ts
export interface CreateInvoiceRequest {
  amount: number; // Valor em centavos (padrão de mercado)
  dueDate: Date;
  customer: {
    name: string;
    document: string; // CPF ou CNPJ
    email: string;
  };
  description?: string;
  metadata?: Record<string, any>; // Para guardar o contractId, por exemplo
}

export interface InvoiceResponse {
  providerId: string; // ID no banco (Cora/Stripe)
  status: "PENDING" | "PAID" | "CANCELLED";
  copyPasteCode?: string; // PIX copia e cola
  qrCodeImage?: string; // Base64 ou URL do QR Code
  pdfUrl?: string;
  rawResponse: any; // Resposta bruta para log
}

export interface IBankingService {
  createInvoice(data: CreateInvoiceRequest): Promise<InvoiceResponse>;
  getInvoiceStatus(providerId: string): Promise<InvoiceResponse["status"]>;
  cancelInvoice(providerId: string): Promise<void>;
}
