import { envVariables } from "@/env";
import {
  IDocumentSignService,
  SignerRequest,
  DocumentStatus,
  DocumentTokenResponse,
  Document,
} from "./IDocumentSignService";
import { handleErrors } from "@/errors/handleErrors";
import { ExternalServiceError, ValidationError } from "@/errors";

export class DocumensoDocumentSign implements IDocumentSignService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl =
      envVariables.DOCUMENSO_API_URL || "http://localhost:3001/api/v2";
    this.apiKey = envVariables.DOCUMENSO_API_KEY || "";
  }

  private async request(endpoint: string, options: RequestInit) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "X-API-KEY": this.apiKey,
      ...(options.headers as any),
    };

    // Só adiciona JSON se não for FormData
    if (options.body instanceof FormData) {
      delete headers["Content-Type"];
    } else {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json(); // O Documenso costuma retornar um JSON com o erro
      console.error(
        "DETALHE DO ERRO DOCUMENSO:",
        JSON.stringify(errorBody, null, 2)
      );
      throw new ExternalServiceError("Documenso", `Documenso API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async createDocument(
    file: Buffer,
    title: string,
    signers: SignerRequest[]
  ): Promise<string> {
    try {
      const formData = new FormData();

      // Na v2, o payload deve ser um objeto JSON stringificado
      const payload = {
        title: title,
        recipients: signers,
      };

      formData.append("payload", JSON.stringify(payload));

      // O arquivo binário
      const blob = new Blob([new Uint8Array(file)], {
        type: "application/pdf",
      });
      formData.append(
        "file",
        blob,
        title.endsWith(".pdf") ? title : `${title}.pdf`
      );

      // Tente esta rota (o padrão da v2)
      const data = await this.request("/document/create", {
        method: "POST",
        body: formData,
      });

      return data.id;
    } catch (error) {
      const message = handleErrors(error, null, {
        message: "Erro ao tentar criar o documento",
      });
      throw new ValidationError(message);
    }
  }

  async addSigners(
    documentId: string,
    signers: SignerRequest[]
  ): Promise<void> {
    try {
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
    } catch (error) {
      const message = handleErrors(error, null, {
        message: "Erro ao tentar adicionar assinaturas ao documento",
      });
      throw new ValidationError(message);
    }
  }

  async sendForSignature(documentId: string): Promise<void> {
    try {
      await this.request(`/document/distribute`, {
        method: "POST",
        body: JSON.stringify({ documentId }),
      });
    } catch (error) {
      const message = handleErrors(error, null, {
        message:
          "Erro ao tentar encaminhar o documento para assinatura das partes interessadas",
      });
      throw new ValidationError(message);
    }
  }

  async cancelDocument(documentId: string): Promise<void> {
    try {
      const documentInfo = await this.getDocumentInfo(documentId);

      await this.request(`/envelope/delete`, {
        method: "POST",
        body: JSON.stringify({ envelopeId: documentInfo.envelopeId }),
      });
    } catch (error) {
      const message = handleErrors(error, null, {
        message: "Erro ao tentar cancelar o documento de assinatura",
      });
      throw new ValidationError(message);
    }
  }

  async getDocumentStatus(documentId: string): Promise<DocumentStatus> {
    try {
      const data = await this.request(`/document/${documentId}`, {
        method: "GET",
      });

      return {
        id: data.id,
        status: data.status, // Mapear para o enum da interface se necessário
        isCompleted: data.status === "COMPLETED",
        signedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      };
    } catch (error) {
      const message = handleErrors(error, null, {
        message: "Erro ao tentar recuperar o status do documento",
      });
      throw new ValidationError(message);
    }
  }

  async getSignedDocument(documentId: string): Promise<Buffer> {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.apiKey}`,
        "X-API-KEY": this.apiKey,
      };
      const response = await fetch(
        `${this.baseUrl}/document/${documentId}/download?version=signed`,
        {
          headers,
        }
      );

      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      const message = handleErrors(error, null, {
        message: "Erro ao tentar recuperar o documento assinado",
      });
      throw new ValidationError(message);
    }
  }

  async getDocumentInfo(documentId: string): Promise<Document> {
    try {
      const data = await this.request(`/document/${documentId}`, {
        method: "GET",
      });

      return data;
    } catch (error) {
      const message = handleErrors(error, null, {
        message: "Erro ao tentar recuperar os dados do documento",
      });
      throw new ValidationError(message);
    }
  }

  async getSigningTokens(documentId: string): Promise<DocumentTokenResponse[]> {
    try {
      // Na v2, buscamos os detalhes do documento para pegar os recipients
      const data = await this.request(`/document/${documentId}`, {
        method: "GET",
      });

      return data.recipients.map((r: any) => ({
        email: r.email,
        token: r.token, // Este é o token que você extrai da URL ou o campo direto
        signingUrl: r.signingUrl,
      }));
    } catch (error) {
      const message = handleErrors(error, null, {
        message: "Erro ao tentar recuperar os dados de token do documento",
      });
      throw new ValidationError(message);
    }
  }
}
