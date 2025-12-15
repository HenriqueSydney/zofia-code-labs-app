import { SUPPORTED_IMAGE_EXTENSIONS } from "./imageExtensionMapper";

export const mimeToExtension = (mime: string) => {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
    "image/*": `.${SUPPORTED_IMAGE_EXTENSIONS.splice(0, 20).join("; .")}..`,
  };
  return map[mime] || "";
};
