import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { createServiceTypeAction } from "@/actions/services/createServiceTypeAction";
import {
  createServiceTypeSchema,
  type CreateServiceTypeSchema,
} from "@/schemas/services/createServiceTypeSchema";
import { Button } from "@/components/ui/button";
import { updateServiceTypeAction } from "@/actions/services/updateServiceTypeAction";
import { CreateServiceDTO } from "@/repositories/IServiceTypeRepository";

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
        const result = await updateServiceTypeAction(data);

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
        className="space-y-6 max-w-lg"
      >
        {/* Nome */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Serviço</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Landing Page Express"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categoria (Select do Shadcn requer tratamento especial no onChange) */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria (para NFe)</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preço Base */}
        <FormField
          control={form.control}
          name="basePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço Base (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  disabled={isPending}
                  {...field}
                  // O Zod coerce resolve a string -> number, mas mantemos o onChange padrão
                />
              </FormControl>
              <FormDescription>
                Deixe zerado se for sob orçamento.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes do que está incluso..."
                  className="resize-none"
                  rows={4}
                  disabled={isPending}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && "Salvando..."}
            {!isPending && service ? "Salvando..." : "Editar Categoria"}
            {!isPending && !service ? "Salvando..." : "Criar Categoria"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
