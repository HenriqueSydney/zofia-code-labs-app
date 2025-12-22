import {
  IDocumentSignService,
  SignerRequest,
  DocumentStatus,
} from "./IDocumentSignService";

export class DocumensoDocumentSign implements IDocumentSignService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl =
      process.env.DOCUMENSO_API_URL || "http://localhost:3001/api/v1";
    this.apiKey = process.env.DOCUMENSO_API_KEY || "";
  }

  private async request(endpoint: string, options: RequestInit) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "X-API-KEY": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Documenso API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async createDocument(file: Buffer, title: string): Promise<string> {
    // No Documenso, o upload geralmente é via multipart/form-data
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file)], { type: "application/pdf" });
    formData.append("file", blob, title);

    const data = await this.request("/documents", {
      method: "POST",
      body: formData, // Ajustar headers para multipart se necessário
    });

    return data.id;
  }

  async addSigners(
    documentId: string,
    signers: SignerRequest[]
  ): Promise<void> {
    for (const signer of signers) {
      // 1. Adiciona o destinatário
      const recipient = await this.request(
        `/documents/${documentId}/recipients`,
        {
          method: "POST",
          body: JSON.stringify({
            email: signer.email,
            name: signer.name,
            role: signer.role,
          }),
        }
      );

      // 2. Cria um campo de assinatura automático (ex: no fim da primeira página)
      await this.request(`/documents/${documentId}/fields`, {
        method: "POST",
        body: JSON.stringify({
          type: "SIGNATURE",
          recipientId: recipient.id,
          pageNumber: 1, // Lógica para definir página pode ser expandida
          pageX: 10,
          pageY: 10,
        }),
      });
    }
  }

  async sendForSignature(documentId: string): Promise<void> {
    await this.request(`/documents/${documentId}/send`, {
      method: "POST",
    });
  }

  async getDocumentStatus(documentId: string): Promise<DocumentStatus> {
    const data = await this.request(`/documents/${documentId}`, {
      method: "GET",
    });

    return {
      id: data.id,
      status: data.status, // Mapear para o enum da interface se necessário
      isCompleted: data.status === "COMPLETED",
      signedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    };
  }

  async getSignedDocument(documentId: string): Promise<Buffer> {
    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/download`,
      {
        headers: { "X-API-KEY": this.apiKey },
      }
    );

    return Buffer.from(await response.arrayBuffer());
  }
}
