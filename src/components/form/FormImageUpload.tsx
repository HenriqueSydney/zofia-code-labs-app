"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Control } from "react-hook-form";
import { ImagePlus, X, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/utils/twMerge";
import { useTranslations } from "next-intl";

interface FormImageUploadProps {
  control: Control<any>;
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function FormImageUpload({
  control,
  name,
  label,
  description,
  disabled,
  className,
}: FormImageUploadProps) {
  const t = useTranslations("components.form.imageUpload");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, onChange, ...fieldProps } }) => {
        const [preview, setPreview] = useState<string | null>(null);

        // Efeito para gerenciar o preview baseado no valor do formulário
        useEffect(() => {
          if (typeof value === "string") {
            // Cenário: Edição (URL vinda do banco)
            setPreview(value);
          } else if (value instanceof File) {
            // Cenário: Novo Upload
            const objectUrl = URL.createObjectURL(value);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl); // Limpeza de memória
          } else {
            // Cenário: Campo limpo
            setPreview(null);
          }
        }, [value]);

        const onDrop = useCallback(
          (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (file) {
              onChange(file); // Atualiza o form com o objeto File
            }
          },
          [onChange],
        );

        const onDropRejected = useCallback(
          (fileRejections: FileRejection[]) => {
            const error = fileRejections[0]?.errors[0];
            if (error) {
              if (error.code === "file-too-large") {
                toast.error(t("errors.tooLarge"));
              } else if (error.code === "file-invalid-type") {
                toast.error(t("errors.invalidType"));
              } else {
                toast.error(error.message);
              }
            }
          },
          [t],
        );

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop,
          onDropRejected,
          accept: {
            "image/png": [],
            "image/jpeg": [],
            "image/webp": [],
          },
          maxFiles: 1,
          maxSize: 5 * 1024 * 1024, // 5MB
          disabled,
        });

        const handleRemove = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(null); // Limpa o valor no RHF
        };

        return (
          <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            {/* Wrapper div instead of FormControl to avoid event bubbling issues */}
            <div className="space-y-2">
              {preview ? (
                // --- MODO PREVIEW ---
                <div className="relative mt-2 flex items-center justify-center rounded-lg border border-border bg-background p-2 shadow-sm transition-all hover:bg-accent/50 group">
                  <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-md bg-muted/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={t("previewAlt")}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={disabled}
                    className="absolute -top-2 -right-2 flex cursor-pointer h-8 w-8 items-center justify-center rounded-full bg-destructive text-white shadow-md transition-all hover:bg-destructive/90 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Só mostra nome do arquivo se for um File novo */}
                  {value instanceof File && (
                    <div className="absolute bottom-2 left-2 right-2 rounded-md bg-black/60 px-2 py-1 text-center text-xs text-white backdrop-blur-sm truncate">
                      {value.name} ({(value.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              ) : (
                // --- MODO DROPZONE ---
                <div
                  {...getRootProps()}
                  className={cn(
                    "relative mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/5 px-6 py-8 text-center transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isDragActive && "border-primary bg-primary/5",
                    disabled &&
                      "cursor-not-allowed opacity-60 hover:bg-transparent",
                  )}
                >
                  <input {...getInputProps()} />

                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {isDragActive ? (
                      <UploadCloud className="h-5 w-5 text-primary animate-bounce" />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {isDragActive ? (
                        <span className="text-primary">{t("dropActive")}</span>
                      ) : (
                        t("selectOrDrag")
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("formats")}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {description && !preview && (
              <FormDescription>{description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
