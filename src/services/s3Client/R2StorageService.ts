import { ValidationError, ExternalServiceError } from "@/errors";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  _Object,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IS3StorageService, R2Object } from "./IS3StorageService";

export class R2StorageService implements IS3StorageService {
  private client: S3Client;
  private bucketName: string;
  private publicUrl?: string;

  constructor(
    accountId: string,
    accessKeyId: string,
    secretAccessKey: string,
    bucketName: string,
    publicUrl?: string
  ) {
    this.bucketName = bucketName;
    this.publicUrl = publicUrl;

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  getInstance(): S3Client {
    return this.client;
  }

  /**
   * Recupera o conteúdo de um arquivo do R2 como Buffer
   */
  async getFileBuffer(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const response = await this.client.send(command);

      if (!response.Body) {
        throw new ValidationError("Corpo do arquivo vazio.");
      }

      // Converte o stream de resposta em um array de bytes e depois em Buffer
      const bytes = await response.Body.transformToByteArray();
      return Buffer.from(bytes);
    } catch (error) {
      console.error(`Erro ao baixar buffer (Key: ${key}):`, error);
      throw new ExternalServiceError("Storage", "Não foi possível recuperar o conteúdo do arquivo.");
    }
  }

  async upload(
    file: File | Buffer,
    key: string,
    contentType: string
  ): Promise<{ key: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: { "original-content-type": contentType },
    });

    try {
      await this.client.send(command);
      return { key };
    } catch (error) {
      console.error(`Erro no upload (Key: ${key}):`, error);
      throw new ExternalServiceError("Storage", "Falha ao carregar arquivo para o storage.");
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error(`Erro ao gerar URL assinada (Key: ${key}):`, error);
      throw new ExternalServiceError("Serviço externo", "Falha ao gerar link temporário.");
    }
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error(`Erro ao deletar (Key: ${key}):`, error);
      throw new ExternalServiceError("Storage", "Falha ao excluir arquivo do storage.");
    }
  }

  async list(prefix?: string): Promise<R2Object[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
    });

    try {
      const response = await this.client.send(command);
      return (response.Contents || []) as R2Object[];
    } catch (error) {
      console.error(`Erro ao listar objetos (Prefix: ${prefix}):`, error);
      throw new ExternalServiceError("Storage", "Falha ao listar arquivos do storage.");
    }
  }
}
