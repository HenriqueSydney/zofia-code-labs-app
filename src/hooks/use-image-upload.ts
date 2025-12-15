import { useCallback } from "react";

export const useImageUpload = () => {
  const uploadFn = useCallback(async (file: File): Promise<string> => {
    // 1. Validação Client-side
    if (!file.type.includes("image/")) {
      throw new Error("Arquivo não é uma imagem.");
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      throw new Error("Imagem muito grande (max 5MB).");
    }

    // 2. Simulação de Upload (Substitua pela sua chamada real ao R2/S3)
    // Exemplo real:
    // const formData = new FormData()
    // formData.append('file', file)
    // const res = await fetch('/api/upload', { method: 'POST', body: formData })
    // const data = await res.json()
    // return data.url

    return new Promise((resolve) => {
      console.log("Enviando imagem...", file.name);
      setTimeout(() => {
        // Retorna uma imagem de exemplo por enquanto
        resolve(
          "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&fit=max"
        );
      }, 1500);
    });
  }, []);

  return { uploadFn };
};
