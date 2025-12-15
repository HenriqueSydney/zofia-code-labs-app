import { S3Client } from "@aws-sdk/client-s3";

export interface R2Object {
  Key?: string;
  LastModified?: Date;
  ETag?: string;
  Size?: number;
  StorageClass?: string;
}

export interface IS3StorageService {
  getInstance(): S3Client;
  upload(
    file: File | Buffer,
    key: string,
    contentType: string
  ): Promise<string>;

  getSignedUrl(key: string, expiresIn?: number): Promise<string>;

  delete(key: string): Promise<void>;

  list(prefix?: string): Promise<R2Object[]>;
}
