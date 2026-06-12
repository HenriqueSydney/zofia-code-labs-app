"use client";

import { useCallback } from "react";
import { useDropzone, FileRejection, Accept } from "react-dropzone";
import { Control } from "react-hook-form";
import {
  FileText,
  UploadCloud,
  X,
  File as FileIcon,
  FileImage,
} from "lucide-react";
import { toast } from "sonner";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Opcional, para listas longas
import { cn } from "@/utils/twMerge";
import { formatBytes } from "@/utils/formatBytes";
import { useTranslations } from "next-intl";

interface FormMultiFileUploadProps {
  control: Control<any>;
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
  maxFiles?: number;
  maxSize?: number; // Em bytes (ex: 5 * 1024 * 1024 = 5MB)
  accept?: Accept; // Tipos aceitos do Dropzone
}

export function FormMultiFileUpload({
  control,
  name,
  label,
  description,
  disabled,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // Default 5MB
  accept = {
    "image/*": [],
    "application/pdf": [],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      [],
  },
}: FormMultiFileUploadProps) {
  const t = useTranslations("components.form.multiFileUpload");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value = [], onChange } }) => {
        // Garantir que value seja sempre um array
        const files: File[] = Array.isArray(value) ? value : [];

        const onDrop = useCallback(
          (acceptedFiles: File[]) => {
            // Calcula quantos arquivos ainda podem ser adicionados
            const availableSlots = maxFiles - files.length;

            if (availableSlots <= 0) {
              toast.error(t("errors.limitReached", { count: maxFiles }));
              return;
            }

            // Pega apenas os que cabem no limite restante
            const newFiles = acceptedFiles.slice(0, availableSlots);

            if (newFiles.length < acceptedFiles.length) {
              toast.warning(
                t("errors.partialAdd", { count: newFiles.length }),
              );
            }

            // Atualiza o form (mantém os antigos + adiciona novos)
            onChange([...files, ...newFiles]);
          },
          [files, maxFiles, onChange, t],
        );

        const onDropRejected = useCallback(
          (fileRejections: FileRejection[]) => {
            const error = fileRejections[0]?.errors[0];
            if (error) {
              if (error.code === "file-too-large") {
                toast.error(
                  t("errors.tooLarge", { size: formatBytes(maxSize) }),
                );
              } else if (error.code === "too-many-files") {
                toast.error(t("errors.tooMany", { count: maxFiles }));
              } else {
                toast.error(error.message);
              }
            }
          },
          [maxSize, maxFiles, t],
        );

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop,
          onDropRejected,
          accept,
          maxSize,
          maxFiles, // O dropzone usa isso para validar o drop atual, não o total acumulado
          disabled: disabled || files.length >= maxFiles,
        });

        const removeFile = (indexToRemove: number) => {
          const newFiles = files.filter((_, index) => index !== indexToRemove);
          onChange(newFiles);
        };

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {/* --- ÁREA DE DROP --- */}
                {files.length < maxFiles && (
                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/5 px-6 py-8 text-center transition-colors hover:bg-muted/20",
                      isDragActive && "border-primary bg-primary/5",
                      disabled && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
                      <UploadCloud className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-sm">{t("clickOrDrag")}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("hint", {
                        count: maxFiles,
                        size: formatBytes(maxSize),
                      })}
                    </p>
                  </div>
                )}

                {/* --- LISTA DE ARQUIVOS --- */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("selectedFiles", {
                          current: files.length,
                          max: maxFiles,
                        })}
                      </p>
                    </div>

                    <div className="grid gap-2">
                      {files.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="group flex items-center justify-between p-3 border rounded-md bg-background hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex h-9 w-9 items-center justify-center rounded bg-primary/10 text-primary">
                              {/* Ícone dinâmico simples */}
                              {file.type.startsWith("image/") ? (
                                <FileImage className="h-4 w-4" />
                              ) : (
                                <FileIcon className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex flex-col truncate">
                              <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">
                                {file.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatBytes(file.size)}
                              </span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive opacity-70 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile(index)}
                            disabled={disabled}
                          >
                            <X className="w-4 h-4" />
                            <span className="sr-only">{t("removeFile")}</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
