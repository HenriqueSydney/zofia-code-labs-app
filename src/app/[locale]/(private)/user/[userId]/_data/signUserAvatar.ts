import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";

export async function signUserAvatar(
  image: string | null,
): Promise<string | null> {
  if (!image) return null;

  const isExternalUrl = image.startsWith("http");
  if (isExternalUrl) return image;

  try {
    const storageService = makeS3StorageService();
    return await storageService.getSignedUrl(image, 3600);
  } catch (error) {
    console.error("Falha ao gerar URL assinada do avatar", error);
    return null;
  }
}
