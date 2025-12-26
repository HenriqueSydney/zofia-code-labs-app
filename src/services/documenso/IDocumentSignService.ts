export type SignerStatus =
  | "PENDING"
  | "SIGNED"
  | "DECLINED"
  | "CANCELLED"
  | "COMPLETED";

export interface SignerRequest {
  name: string;
  email: string;
  role: "SIGNER" | "VIEWER" | "APPROVER";
}

export interface DocumentStatus {
  id: string;
  status: SignerStatus;
  isCompleted: boolean;
  signedAt?: Date;
}

export interface DocumentTokenResponse {
  email: string;
  token: string;
  signingUrl: string;
}

export interface IDocumentSignService {
  /** Cria um novo documento no provedor */
  createDocument(
    file: Buffer,
    title: string,
    signers: SignerRequest[]
  ): Promise<string>;

  /** Define quem deve assinar e onde (campos) */
  addSigners(documentId: string, signers: SignerRequest[]): Promise<void>;

  /** Dispara o processo de coleta de assinaturas (envia e-mails) */
  sendForSignature(documentId: string): Promise<void>;

  /** Verifica o status atual do documento */
  getDocumentStatus(documentId: string): Promise<DocumentStatus>;

  /** Obtém a URL ou Buffer do arquivo final assinado */
  getSignedDocument(documentId: string): Promise<string | Buffer>;

  getSigningTokens(documentId: string): Promise<DocumentTokenResponse[]>;
}
