import { ValidationError, ExternalServiceError } from "@/errors";
import { handleErrors } from "@/errors/handleErrors";

interface FileValidationOptions {
  maxSizeInMB?: number;
  allowedMimeTypes?: string[];
}

interface PrepareFileToUploadProps {
  file: File;
  folderName: string;
  options?: FileValidationOptions;
}

export async function prepareFileToUpload({
  file,
  folderName,
  options = {},
}: PrepareFileToUploadProps) {
  const {
    maxSizeInMB = 5,
    allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/pdf",
      "application/pdf",
    ],
  } = options;

  // 1. Validação básica de existência
  if (!file || !(file instanceof File)) {
    throw new ValidationError("O objeto fornecido não é um arquivo válido.");
  }

  // 2. Validação de Tamanho
  const maxSize = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSize) {
    throw new ValidationError(`Arquivo muito grande. O limite é de ${maxSizeInMB}MB.`);
  }

  // 3. Validação de Tipo MIME (Extensão/Header)
  if (!allowedMimeTypes.includes(file.type)) {
    throw new ValidationError(`Tipo de arquivo não permitido: ${file.type}`);
  }

  try {
    // 4. Geração da Key
    // Sanitizar o nome do arquivo para evitar caracteres especiais na URL
    const sanitizedName = file.name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.\-_]/g, "");
    const key = `${folderName}/${Date.now()}-${sanitizedName}`;

    // 5. Conversão para Buffer
    const arrayBuffer = await file.arrayBuffer();

    // Validação de integridade: se o arrayBuffer está vazio
    if (arrayBuffer.byteLength === 0) {
      throw new ValidationError("O conteúdo do arquivo está vazio ou corrompido.");
    }

    const buffer = Buffer.from(arrayBuffer);

    const extension = file.name.split(".").pop()?.toLowerCase() || "";

    return {
      buffer,
      key,
      mimeType: file.type,
      size: file.size,
      originalName: file.name,
      extension,
    };
  } catch (error) {
    handleErrors(error);
    throw new ExternalServiceError("Serviço externo", "Falha ao processar a estrutura binária do arquivo.");
  }
}
