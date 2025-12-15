"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Phone, Building2, FileText } from "lucide-react";

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

// Importe o InputMask ajustado anteriormente
import { InputMask } from "@/components/InputMask";

// Importe o Schema de validação
import {
  clientFormSchema,
  ClientFormSchemaType,
} from "@/schemas/clients/clientFormSchema";
import { updateClientAction } from "@/actions/clients/updateClientAction";
import { createClientAction } from "@/actions/clients/createClientAction";

// Tipagem baseada no seu DTO de cliente
interface IClientFormProps {
  client?: {
    id: string;
    companyName: string;
    tradeName?: string | null;
    cnpj?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  handleCloseModal: () => void;
}

export function ClientForm({ client, handleCloseModal }: IClientFormProps) {
  const [isPending, startTransition] = useTransition();
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

  const onSubmit = (data: ClientFormSchemaType) => {
    startTransition(async () => {
      // Converta o objeto data para FormData pois suas actions esperam FormData
      const formData = new FormData();
      formData.append("companyName", data.companyName);
      formData.append("tradeName", data.tradeName || "");
      formData.append("cnpj", data.cnpj || "");
      formData.append("email", data.email || "");
      formData.append("phone", data.phone || "");

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

      if (!isEditing) {
        form.reset();
      }

      handleCloseModal();
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-lg"
      >
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
          {/* CNPJ com MÁSCARA */}
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                {/* Nota: O InputMask já tem Label interno, mas dentro do FormField 
                    é melhor usarmos a estrutura do FormItem para manter padrão visual e acessibilidade */}
                <FormControl>
                  <InputMask
                    label="CNPJ"
                    mask="00.000.000/0000-00"
                    placeholder="00.000.000/0001-99"
                    icon={<Building2 className="h-4 w-4" />}
                    disabled={isPending}
                    // Repassa as props do react-hook-form (onChange, value, ref, etc)
                    {...field}
                    // Passamos o erro explicitamente para o InputMask pintar a borda vermelha
                    inputError={form.formState.errors.cnpj}
                  />
                </FormControl>
                {/* Se o InputMask já exibe mensagem de erro interna, remova o FormMessage abaixo */}
              </FormItem>
            )}
          />

          {/* Telefone com MÁSCARA */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputMask
                    label="Telefone"
                    mask="(00) 00000-0000" // Ou máscara dinâmica se seu mask util suportar
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

        {/* Email */}
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
