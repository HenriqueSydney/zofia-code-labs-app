"use client";

import { useTransition, useState } from "react"; // Adicionado useState
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Phone, Building2, ImagePlus, X } from "lucide-react"; // Novos ícones

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputMask } from "@/components/InputMask";
import { Label } from "@/components/ui/label";

import {
  clientFormSchema,
  ClientFormSchemaType,
} from "@/schemas/clients/clientFormSchema";
import { updateClientAction } from "@/actions/clients/updateClientAction";
import { createClientAction } from "@/actions/clients/createClientAction";

interface IClientFormProps {
  client?: {
    id: string;
    companyName: string;
    tradeName?: string | null;
    cnpj?: string | null;
    email?: string | null;
    phone?: string | null;
    logoUrl?: string | null; // Adicionado para exibir logo existente na edição
  };
  handleCloseModal: () => void;
}

export function ClientForm({ client, handleCloseModal }: IClientFormProps) {
  const [isPending, startTransition] = useTransition();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    client?.logoUrl || null
  );

  const isEditing = !!client;

  const form = useForm<ClientFormSchemaType>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      companyName: client?.companyName ?? "",
      tradeName: client?.tradeName ?? "",
      cnpj: client?.cnpj ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
    },
  });

  // Função para lidar com a seleção da imagem
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = (data: ClientFormSchemaType) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("companyName", data.companyName);
      formData.append("tradeName", data.tradeName || "");
      formData.append("cnpj", data.cnpj || "");
      formData.append("email", data.email || "");
      formData.append("phone", data.phone || "");

      // Adiciona o arquivo do logo ao FormData
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      let result;
      if (isEditing) {
        result = await updateClientAction(client.id, formData);
      } else {
        result = await createClientAction(formData);
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      if (!isEditing) form.reset();
      handleCloseModal();
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-lg"
      >
        {/* Campo de Logo com Preview */}
        <div className="space-y-3 border p-4 rounded-md bg-muted/20 border-dashed">
          <Label className="text-sm font-medium">Logo da Empresa</Label>

          <div className="flex items-center gap-4">
            {previewUrl ? (
              <div className="relative h-20 w-20 border rounded-md overflow-hidden bg-white">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setLogoFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5 rounded-bl-md"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="h-20 w-20 border-2 border-dashed rounded-md flex items-center justify-center bg-background">
                <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
              </div>
            )}

            <div className="flex-1">
              <Input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="cursor-pointer"
                onChange={handleLogoChange}
                disabled={isPending}
              />
              <p className="text-[10px] text-muted-foreground mt-2">
                Formatos aceitos: PNG, JPG ou WebP. Máx 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Razão Social */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Razão Social</FormLabel>
              <FormControl>
                <Input
                  placeholder="Minha Empresa LTDA"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nome Fantasia */}
        <FormField
          control={form.control}
          name="tradeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Fantasia</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome comercial"
                  disabled={isPending}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputMask
                    label="CNPJ"
                    mask="00.000.000/0000-00"
                    placeholder="00.000.000/0001-99"
                    icon={<Building2 className="h-4 w-4" />}
                    disabled={isPending}
                    {...field}
                    inputError={form.formState.errors.cnpj}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputMask
                    label="Telefone"
                    mask="(00) 00000-0000"
                    placeholder="(61) 99999-9999"
                    icon={<Phone className="h-4 w-4" />}
                    disabled={isPending}
                    {...field}
                    inputError={form.formState.errors.phone}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="contato@empresa.com"
                    className="pl-9"
                    disabled={isPending}
                    {...field}
                    value={field.value || ""}
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Salvando..."
              : isEditing
              ? "Salvar Alterações"
              : "Cadastrar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
