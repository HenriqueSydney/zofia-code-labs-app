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
   * Upload de arquivo para o R2
   * @param file - Arquivo ou Buffer para upload
   * @param key - Caminho/nome do arquivo no bucket
   * @param contentType - MIME type do arquivo
   * @returns URL pública do arquivo
   */
  async upload(
    file: File | Buffer,
    key: string,
    contentType: string
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await this.client.send(command);

    return this.publicUrl
      ? `https://${this.publicUrl}/${key}`
      : `https://${this.bucketName}.r2.dev/${key}`;
  }

  /**
   * Gerar URL assinada temporária
   * @param key - Caminho/nome do arquivo
   * @param expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
   * @returns URL assinada
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Deletar arquivo do R2
   * @param key - Caminho/nome do arquivo
   */
  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }

  /**
   * Listar arquivos no bucket
   * @param prefix - Prefixo para filtrar arquivos (opcional)
   * @returns Lista de objetos
   */
  async list(prefix?: string): Promise<R2Object[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
    });

    const response = await this.client.send(command);
    return (response.Contents || []) as R2Object[];
  }
}
