"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner"; // Assumindo que usa Sonner ou similar

import { DropzoneUpload } from "@/components/DropzoneUpload";
import { updateAvatarAction } from "@/actions/users/updateAvatarAction";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { cn } from "@/utils/twMerge";
import { Modal } from "@/components/Modal";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

const clientSchema = z.object({
  file: z.instanceof(File, { message: "Selecione uma imagem." }),
});

type FormSchema = z.infer<typeof clientSchema>;

export function AvatarForm() {
  const {update} = useSession()
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [isModal, setIsModalOpen] = useState(false);

  const {
    setValue,
    handleSubmit,
    formState: { errors },
    trigger,
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(clientSchema),
  });

  const [state, formAction] = useActionState(updateAvatarAction, {
    success: false,
    message: "",
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        setPreview(null);
        handleToogleModal();
        reset();
      } else {
        toast.error(state.message);
      }
    }
  }, [state, reset]);

  // Função chamada ao soltar arquivo no Dropzone
  const onFileSelect = (files: File[]) => {
    const file = files[0];
    if (file) {
      setValue("file", file);
      trigger("file");
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const onSubmit = (data: FormSchema) => {
    const formData = new FormData();
    formData.append("file", data.file);

    startTransition(() => {
      formAction(formData);
    });
  };

  const handleToogleModal = () => {
    setIsModalOpen((prevState) => !prevState);
  };

  return (
    <>
      <button
        className={cn(
          "absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-slate-50 transition-colors",
          "cursor-pointer"
        )}
        onClick={handleToogleModal}
      >
        <Camera className="w-5 h-5 text-slate-700" />
      </button>
      <Modal
        isModalOpen={isModal}
        setIsModalOpen={setIsModalOpen}
        modalTitle={"Atualização de avatar"}
      >
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Área de Preview (Opcional) */}
            {preview && (
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg"
                />
              </div>
            )}

            <div className="space-y-2">
              <DropzoneUpload
                onFileSelect={onFileSelect}
                accept="image/png, image/jpeg, image/webp"
                maxFiles={1}
                helperText="Máximo 5MB (PNG, JPG, WEBP)"
              />

              {/* Erros do Zod (Client) */}
              {errors.file && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.file.message?.toString()}
                </p>
              )}

              {/* Erros vindos do Server */}
              {state?.errors?.file && (
                <p className="text-sm text-red-500 font-medium">
                  {state.errors.file[0]}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPending || !preview}
                className="w-full sm:w-auto"
              >
                {isPending ? "Enviando..." : "Salvar Avatar"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
