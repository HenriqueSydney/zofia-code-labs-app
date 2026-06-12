export type SignerStatus =
  | "PENDING"
  | "SIGNED"
  | "DECLINED"
  | "CANCELLED"
  | "COMPLETED";

type DocumentSource = "DOCUMENT" | "TEMPLATE" | "TEMPLATE_DIRECT_LINK";

type DocumentVisibility = "EVERYONE" | "MANAGER_AND_ABOVE" | "ADMIN";

type AuthAccessOptions = "ACCOUNT" | "TWO_FACTOR_AUTH";

type AuthActionOptions = "ACCOUNT" | "TWO_FACTOR_AUTH" | "PASSKEY" | "PASSWORD";

export type RecipientRole = "SIGNER" | "VIEWER" | "APPROVER" | "CC";

export type ReadStatus = "NOT_OPENED" | "OPENED";

export type SigningStatus = "NOT_SIGNED" | "SIGNED";

type SendStatus = "NOT_SENT" | "SENT";

type FieldType =
  | "SIGNATURE"
  | "EMAIL"
  | "NAME"
  | "DATE"
  | "TEXT"
  | "NUMBER"
  | "RADIO"
  | "CHECKBOX"
  | "DROPDOWN";

type SigningOrder = "PARALLEL" | "SEQUENTIAL";

type DistributionMethod = "EMAIL" | "NONE";

type FolderType = "DOCUMENT" | "TEMPLATE";

export interface SignerRequest {
  name: string;
  email: string;
  role: "SIGNER" | "VIEWER" | "APPROVER";
}

export interface AuthOptions {
  globalAccessAuth: AuthAccessOptions[];
  globalActionAuth: AuthActionOptions[];
}

export interface RecipientAuthOptions {
  accessAuth: AuthAccessOptions[];
  actionAuth: AuthActionOptions[];
}

export interface DocumentData {
  type: "S3_PATH" | "BYTES_64";
  id: string;
  data: string;
  initialData: string;
  envelopeItemId: string;
}

export interface EmailSettings {
  recipientSigningRequest: boolean;
  recipientRemoved: boolean;
  recipientSigned: boolean;
  documentPending: boolean;
  documentCompleted: boolean;
  documentDeleted: boolean;
  ownerDocumentCompleted: boolean;
}

export interface DocumentMeta {
  signingOrder: SigningOrder;
  distributionMethod: DistributionMethod;
  id: string;
  subject: string | null;
  message: string | null;
  timezone: string | null;
  dateFormat: string | null;
  redirectUrl: string | null;
  typedSignatureEnabled: boolean;
  uploadSignatureEnabled: boolean;
  drawSignatureEnabled: boolean;
  allowDictateNextSigner: boolean;
  language: string;
  emailSettings: EmailSettings;
  emailId: string | null;
  emailReplyTo: string | null;
  password: string | null;
  documentId: number;
}

export interface EnvelopeItem {
  id: string;
  envelopeId: string;
}

export interface Folder {
  id: string;
  name: string;
  type: FolderType;
  visibility: DocumentVisibility;
  userId: number;
  teamId: number;
  pinned: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Recipient {
  envelopeId: string;
  role: RecipientRole;
  readStatus: ReadStatus;
  signingStatus: SigningStatus;
  sendStatus: SendStatus;
  id: number;
  email: string;
  name: string;
  token: string;
  documentDeletedAt: string | null;
  expired: string | null;
  signedAt: string | null;
  authOptions: RecipientAuthOptions;
  signingOrder: number | null;
  rejectionReason: string | null;
  documentId: number | null;
  templateId: number | null;
}

export interface FieldMeta {
  label?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  fontSize?: number;
  type?: string;
}

export interface Field {
  envelopeId: string;
  envelopeItemId: string;
  type: FieldType;
  id: number;
  secondaryId: string;
  recipientId: number;
  page: number;
  positionX: number | null;
  positionY: number | null;
  width: number | null;
  height: number | null;
  customText: string | null;
  inserted: boolean;
  fieldMeta: FieldMeta | null;
  documentId: number | null;
  templateId: number | null;
}

export interface Document {
  visibility: DocumentVisibility;
  status: SignerStatus;
  source: DocumentSource;
  id: number;
  externalId: string | null;
  userId: number;
  authOptions: AuthOptions | null;
  formValues: Record<string, any> | null;
  title: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  deletedAt: string | null;
  teamId: number;
  folderId: string | null;
  envelopeId: string;
  internalVersion: number;
  templateId: number | null;
  documentDataId: string;
  documentData: DocumentData;
  documentMeta: DocumentMeta;
  envelopeItems: EnvelopeItem[];
  folder: Folder | null;
  recipients: Recipient[];
  fields: Field[];
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

  /** Cancela um documento pendente no provedor de assinatura */
  cancelDocument(documentId: string): Promise<void>;

  /** Verifica o status atual do documento */
  getDocumentStatus(documentId: string): Promise<DocumentStatus>;

  /** Verifica o status atual do documento */
  getDocumentInfo(documentId: string): Promise<Document>;

  /** Obtém a URL ou Buffer do arquivo final assinado */
  getSignedDocument(documentId: string): Promise<string | Buffer>;

  getSigningTokens(documentId: string): Promise<DocumentTokenResponse[]>;
}
