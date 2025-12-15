"use client";

import { useTranslations } from "next-intl";
import React, { useCallback, useState, useMemo } from "react";
import { Card, CardContent } from "./ui/card";
import { mimeToExtension } from "@/mappers/mimeToExtensionMapper"; // Mantive seu mapper caso use string
import { cn } from "@/utils/twMerge";

// Tipo compatível com react-dropzone e o uso que sugerimos no form
type AcceptMap = Record<string, string[]>;

type DropzoneUploadProps = {
  containerClassName?: string;
  // Mudança principal: suporta string OU objeto de configuração
  accept?: string | AcceptMap;
  multiple?: boolean;
  maxFiles?: number;
  helperText?: string;

  // Props para funcionar com React Hook Form (Controlled Component)
  value?: File[];
  onChange?: (files: File[]) => void;
  // Mantive para retrocompatibilidade, mas o ideal é usar onChange
  onFileSelect?: (files: File[]) => void;
};

export const DropzoneUpload: React.FC<DropzoneUploadProps> = ({
  containerClassName,
  onFileSelect,
  onChange,
  value = [],
  accept,
  multiple = false,
  maxFiles,
  helperText,
}) => {
  const t = useTranslations("components.dropzone");
  const [isDragging, setIsDragging] = useState(false);

  // Unifica a chamada de evento (prioriza onChange se existir)
  const handleFiles = useCallback(
    (files: File[]) => {
      if (onChange) onChange(files);
      if (onFileSelect) onFileSelect(files);
    },
    [onChange, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length > 0) handleFiles(files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) handleFiles(files);
    },
    [handleFiles]
  );

  // Lógica 1: Gera a string que vai dentro do atributo HTML <input accept="..." />
  const inputAcceptAttribute = useMemo(() => {
    if (!accept) return undefined;
    if (typeof accept === "string") return accept;

    // Se for objeto, converte para string: "application/pdf,.pdf,image/*,.png"
    return Object.entries(accept)
      .map(([mime, exts]) => `${mime},${exts.join(",")}`)
      .join(",");
  }, [accept]);

  // Lógica 2: Gera o texto visual para o usuário ("PDF, PNG, JPG")
  const displayAllowedExtensions = useMemo(() => {
    if (!accept) return t("anyType");

    // Se for string antiga (ex: ".pdf,image/*")
    if (typeof accept === "string") {
      return accept
        .split(",")
        .map((item) => {
          const trimmed = item.trim();
          if (trimmed.includes("/")) return mimeToExtension(trimmed);
          return trimmed; // Já é extensão
        })
        .filter(Boolean)
        .map((ext) => ext?.toUpperCase().replace(".", ""))
        .join(", ");
    }

    // Se for objeto (Novo padrão), extraímos apenas as extensões do values
    // Ex: { 'application/pdf': ['.pdf'] } -> ['.pdf']
    const allExtensions = Object.values(accept).flat();

    // Remove duplicatas e formata
    const uniqueExts = Array.from(new Set(allExtensions));
    return uniqueExts
      .map((ext) => ext.toUpperCase().replace(".", ""))
      .join(", ");
  }, [accept, t]);

  return (
    <Card className={cn("glass-effect", containerClassName)}>
      <CardContent className="pt-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input")?.click()}
          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 w-full h-72 text-center cursor-pointer transition-all duration-300 
            ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]"
                : "border-gray-400 hover:border-blue-400 bg-gray-50/60 dark:bg-gray-800/40"
            }`}
        >
          <input
            id="file-input"
            type="file"
            maxLength={maxFiles}
            accept={inputAcceptAttribute} // Usa a string convertida
            onChange={handleFileInput}
            className="hidden"
            multiple={multiple}
          />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-14 h-14 mb-4 ${
              isDragging ? "text-blue-500" : "text-blue-400"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16v-8m0 0l-3 3m3-3l3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          {/* Feedback visual se já tiver arquivos selecionados (Opcional, mas útil) */}
          {value.length > 0 ? (
            <div className="mb-2">
              <p className="font-semibold text-green-600 dark:text-green-400">
                {value.length}{" "}
                {value.length === 1
                  ? "arquivo selecionado"
                  : "arquivos selecionados"}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[200px] mx-auto">
                {value[0].name} {value.length > 1 && `+ ${value.length - 1}`}
              </p>
            </div>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {t("dragHere")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t("orClickToSelect")}
              </p>
            </>
          )}

          {!helperText && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              {t("allowedExtensions")}: {displayAllowedExtensions}
            </p>
          )}
          {helperText && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              {helperText}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
