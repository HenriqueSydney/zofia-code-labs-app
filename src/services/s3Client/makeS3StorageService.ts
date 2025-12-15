import { envVariables } from "@/env";
import { IS3StorageService } from "./IS3StorageService";
import { R2StorageService } from "./R2StorageService";

let s3Client: IS3StorageService | null = null;

export function makeS3StorageService() {
  if (!s3Client) {
    s3Client = new R2StorageService(
      envVariables.CLOUDFLARE_ACCOUNT_ID,
      envVariables.R2_ACCESS_KEY_ID,
      envVariables.R2_SECRET_ACCESS_KEY,
      envVariables.R2_BUCKET_NAME,
      envVariables.R2_PUBLIC_URL
    );
  }
  return s3Client;
}
