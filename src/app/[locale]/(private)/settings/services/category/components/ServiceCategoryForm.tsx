import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { createServiceCategoryAction } from "@/actions/services/createServiceCategoryAction";
import {
  createServiceCategorySchema,
  type CreateServiceCategorySchema,
} from "@/schemas/services/createServiceCategorySchema";
import { Button } from "@/components/ui/button";
import { updateServiceCategoryAction } from "@/actions/services/updateServiceCategoryAction";
import { CreateServiceCategoryDTO } from "@/repositories/IServiceCategoryRepository";
import { FormInput } from "@/components/form/FormInput";
import { FormTextarea } from "@/components/form/FormTextarea";

export type CategoryOption = {
  id: string;
  name: string;
};

interface IServiceFormProps {
  categories: CategoryOption[];
  serviceCategory?: CreateServiceCategoryDTO & { id: string };
  handleCloseModal: () => void;
}

export function ServiceCategoryForm({
  categories,
  serviceCategory,
  handleCloseModal,
}: IServiceFormProps) {
  const [isPending, startTransition] = useTransition();

  // 1. Tipagem explícita no useForm resolve o conflito do Resolver
  const form = useForm<CreateServiceCategorySchema>({
    resolver: zodResolver(createServiceCategorySchema),
    defaultValues: {
      name: serviceCategory?.name ?? "",
      description: serviceCategory?.description ?? "",
      taxCode: serviceCategory?.taxCode ?? "",
    },
  });

  // 2. O onSubmit agora recebe o tipo correto inferido
  const onSubmit = (data: CreateServiceCategorySchema) => {
    startTransition(async () => {
      if (serviceCategory) {
        const result = await updateServiceCategoryAction(data);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Serviço atualizado com sucesso!");
        form.setValue("taxCode", data.taxCode);
        form.setValue("description", data.description);
        form.setValue("name", data.name);
        form.setValue("organizationId", data.organizationId);
        handleCloseModal();
        return;
      }
      const result = await createServiceCategoryAction(data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Serviço criado com sucesso!");
      form.reset();
      handleCloseModal();
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-lg"
      >
        {/* Nome */}
        <FormInput
          label="Nome da Categoria de Serviço"
          control={form.control}
          name="name"
          placeholder="Ex: Landing Page Express"
          disabled={isPending}
        />

        <FormInput
          label="Código do Imposto (NF-E)"
          control={form.control}
          name="taxCode"
          placeholder="1.01"
          disabled={isPending}
        />

        <FormTextarea
          label="Descrição"
          control={form.control}
          name="description"
          placeholder="Detalhes do que está incluso..."
          className="resize-none"
          rows={4}
          disabled={isPending}
        />

        <div className="w-full flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && "Salvando..."}
            {!isPending && serviceCategory && "Editar Categoria"}
            {!isPending && !serviceCategory && "Criar Categoria"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
