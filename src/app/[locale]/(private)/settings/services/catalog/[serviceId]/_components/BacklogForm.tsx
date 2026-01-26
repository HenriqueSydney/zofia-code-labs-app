"use client";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { backlogPriorityMapper } from "@/mappers/BacklogMappers";
import { useParams } from "next/navigation";
import {
  defaultbacklogItemSchema,
  DefaultBacklogItemSchema,
} from "@/schemas/services/backlog/defaultBacklogItemSchema";
import { BacklogPriorityEnum } from "@/schemas/backlog/backlogItemSchema";
import { createServiceDefaultBacklogItemAction } from "@/actions/services/backlogs/createServiceDefaultBacklogItemAction";
import { updateServiceDefaultBacklogAction } from "@/actions/services/backlogs/updateServiceDefaultBacklogItemAction";
import { useRouter } from "next/navigation";

interface IBacklogForm {
  serviceId: string;
  backlog?: DefaultBacklogItemSchema;
  handleCloseModal: () => void;
}

export function BacklogForm({
  serviceId,
  backlog,
  handleCloseModal,
}: IBacklogForm) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(defaultbacklogItemSchema),
    defaultValues: {
      id: backlog?.id,
      title: backlog?.title ?? "",
      description: backlog?.description ?? "",
      priority: backlog?.priority ?? "LOW",
      points: backlog?.points ?? 0,
      serviceTypeId: serviceId,
    },
  });

  const onSubmit = (data: DefaultBacklogItemSchema) => {
    startTransition(async () => {
      try {
        if (backlog?.id) {
          const result = await updateServiceDefaultBacklogAction(
            { id: backlog.id, ...data },
            serviceId,
          );

          if (!result.success) {
            toast.error(result.message);
            return;
          }

          toast.success("Item atualizado com sucesso!");
        } else {
          const result = await createServiceDefaultBacklogItemAction({
            ...data,
            serviceTypeId: serviceId,
          });

          if (!result.success) {
            toast.error(result.message);
            return;
          }

          toast.success("Item criado com sucesso!");
          form.reset();
        }

        handleCloseModal();
      } catch (error) {
        toast.error("Ocorreu um erro inesperado.");
        console.error(error);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Título */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Tarefa</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Implementar Login OAuth"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Linha: Status e Prioridade */}
        <div className="grid md:grid-cols-3 gap-2">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Prioridade</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BacklogPriorityEnum.options.map((prio) => (
                        <SelectItem key={prio} value={prio}>
                          {backlogPriorityMapper[prio] ?? prio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="points"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Story Points</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    disabled={isPending}
                    {...field}
                    onChange={(e) => {
                      // Converte para número ou undefined se estiver vazio
                      const value =
                        e.target.value === "" ? 0 : Number(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição Detalhada</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Critérios de aceitação, detalhes técnicos..."
                  className="resize-none min-h-[100px]"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full flex justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseModal}
            className="mr-2"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Salvando..."
              : backlog?.id
                ? "Salvar Alterações"
                : "Criar Tarefa"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
