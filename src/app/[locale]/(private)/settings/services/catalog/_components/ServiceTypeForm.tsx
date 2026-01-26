import { Form } from "@/components/ui/form";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import { createServiceTypeAction } from "@/actions/services/createServiceTypeAction";
import {
  createServiceTypeSchema,
  type CreateServiceTypeSchema,
} from "@/schemas/services/createServiceTypeSchema";
import { Button } from "@/components/ui/button";
import { updateServiceTypeAction } from "@/actions/services/updateServiceTypeAction";
import { CreateServiceDTO } from "@/repositories/IServiceTypeRepository";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { FormTextarea } from "@/components/form/FormTextarea";
import { FormCurrencyInput } from "@/components/form/FormCurrencyInput";

export type CategoryOption = {
  id: string;
  name: string;
};

interface IServiceFormProps {
  categories: CategoryOption[];
  service?: CreateServiceDTO & { id: string };
  handleCloseModal: () => void;
}

export function ServiceTypeForm({
  categories,
  service,
  handleCloseModal,
}: IServiceFormProps) {
  const [isPending, startTransition] = useTransition();

  // 1. Tipagem explícita no useForm resolve o conflito do Resolver
  const form = useForm<CreateServiceTypeSchema>({
    resolver: zodResolver(createServiceTypeSchema),
    defaultValues: {
      name: service?.name ?? "",
      description: service?.description ?? "",
      basePrice: service?.basePrice ?? 0,
      categoryId: service?.categoryId ?? "",
      active: service?.active ?? true,
    },
  });

  // 2. O onSubmit agora recebe o tipo correto inferido
  const onSubmit = (data: CreateServiceTypeSchema) => {
    startTransition(async () => {
      if (service) {
        const result = await updateServiceTypeAction({
          ...data,
          id: service.id,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Serviço atualizado com sucesso!");
        form.setValue("basePrice", data.basePrice);
        form.setValue("categoryId", data.categoryId);
        form.setValue("description", data.description);
        form.setValue("name", data.name);
        form.setValue("organizationId", data.organizationId);
        form.setValue("active", data.active);
        handleCloseModal();
        return;
      }
      const result = await createServiceTypeAction(data);

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
        className="space-y-6 max-w-2xl"
      >
        <FormInput
          label="Nome do Serviço"
          control={form.control}
          name="name"
          placeholder="Ex: Landing Page Express"
          disabled={isPending}
        />

        <FormSelect
          label="Categoria (para NFe)"
          control={form.control}
          name="categoryId"
          placeholder="Selecione uma categoria..."
          options={categories.map((cat) => ({
            value: cat.id,
            label: cat.name,
          }))}
          disabled={isPending}
        />

        <FormCurrencyInput
          control={form.control}
          name="basePrice"
          label="Preço Base"
          placeholder="R$ 0,00"
          description="Deixe zerado ou vazio se for sob orçamento."
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
            {!isPending && service && "Editar Categoria"}
            {!isPending && !service && "Criar Categoria"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
