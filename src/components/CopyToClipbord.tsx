"use client";

import { CheckCircle, Copy } from "lucide-react";

import { toast } from "@/hooks/use-toast";

import { Tooltip } from "./Tooltip";

interface ICopyToClipboard {
  id: string;
  content: string;
  description: string
  showDescription: boolean
}

export function CopyToClipboard({
  description,
  showDescription = false,
  content,
  id,
}: ICopyToClipboard) {
  function handleCopyContent() {
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        console.log("Conteúdo copiado:", content);
      });
    } else {
      const contentElement = document.getElementById(`copy_content_${id}`);
      if (contentElement) {
        const textToCopy = contentElement.innerText.trim(); // Pega apenas o texto visível
        navigator.clipboard.writeText(textToCopy).then(() => {
          console.log("Conteúdo copiado:", textToCopy);
        });
      }
    }

    toast({
      title: "Conteúdo copiado com sucesso",
      action: (
        <CheckCircle className="h-7 w-7 text-green-500" />
      ),
    });
  }
  return (
    <div className="d-flex align-items-center">
      <Tooltip description={description} className='bg-background p-2 m-0'>
        <button onClick={() => handleCopyContent()} className="flex gap-2">
          <Copy className="w-4 h-4" />
          {showDescription && description}
        </button>

      </Tooltip>

    </div>
  );
}