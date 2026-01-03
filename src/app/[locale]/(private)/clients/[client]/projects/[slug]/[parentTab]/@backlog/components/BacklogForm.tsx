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

import { useEffect, useEffectEvent, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Certifique-se de que o caminho do schema está correto
import {
  BacklogItemSchema,
  backlogItemSchema,
  BacklogStatusEnum, // Importado do arquivo de schema criado anteriormente
  BacklogPriorityEnum, // Importado do arquivo de schema criado anteriormente
} from "@/schemas/backlog/backlogItemSchema";
import { updateBacklogAction } from "@/actions/backlog/updateBacklogItemAction";
import { createBacklogAction } from "@/actions/backlog/createBacklogItemAction";
import { listUsersByOrganizationAction } from "@/actions/users/listUsersByOrganizationAction";
import { useSession } from "next-auth/react";
import {
  backlogPriorityMapper,
  backlogStatusMapper,
} from "@/mappers/BacklogMappers";

export type AssigneeOption = {
  id: string;
  name: string | null;
  email?: string;
};

interface IBacklogForm {
  projectId: string;
  backlog?: BacklogItemSchema;
  handleCloseModal: () => void;
}

export function BacklogForm({
  projectId,
  backlog,
  handleCloseModal,
}: IBacklogForm) {
  const { data: session } = useSession();
  const [assigneesOptions, setAssigneesOptions] = useState<AssigneeOption[]>(
    []
  );
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(backlogItemSchema),
    defaultValues: {
      id: backlog?.id,
      title: backlog?.title ?? "",
      description: backlog?.description ?? "",
      status: backlog?.status ?? "TODO",
      priority: backlog?.priority ?? "LOW",
      points: backlog?.points ?? 0,
      externalLink: backlog?.externalLink ?? "",
      assigneeId: backlog?.assigneeId ?? null,
      projectId,
    },
  });

  const onSubmit = (data: BacklogItemSchema) => {
    startTransition(async () => {
      try {
        if (backlog?.id) {
          const result = await updateBacklogAction(data);

          if (!result.success) {
            toast.error(result.message);
            return;
          }

          toast.success("Item atualizado com sucesso!");
        } else {
          // --- MODO CRIAÇÃO ---
          const result = await createBacklogAction({ ...data, projectId });

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

  const populateAssignOptions = async () => {
    if (!session) return;
    const orgUsers = await listUsersByOrganizationAction(
      session.user.organizationId
    );

    if (orgUsers.success) {
      const assigneesOptions = orgUsers.data.users.map((orgUsers) => ({
        id: orgUsers.id,
        name: orgUsers.name,
      }));

      setAssigneesOptions(assigneesOptions);
    }
  };

  useEffect(() => {
    populateAssignOptions();
  }, []);

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
        <div className="flex flex-col sm:flex-row gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BacklogStatusEnum.options.map((status) => (
                      <SelectItem key={status} value={status}>
                        {backlogStatusMapper[status] ?? status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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

        {/* Linha: Pontos e Responsável */}
        <div className="flex flex-col sm:flex-row gap-4">
          <FormField
            control={form.control}
            name="points"
            render={({ field }) => (
              <FormItem className="w-full sm:w-32">
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

          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Responsável</FormLabel>
                <Select
                  onValueChange={(val) =>
                    field.onChange(val === "unassigned" ? null : val)
                  }
                  value={field.value ?? "unassigned"}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      -- Não atribuído --
                    </SelectItem>
                    {assigneesOptions.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        {/* Link Externo */}
        <FormField
          control={form.control}
          name="externalLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link Externo (Opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://jira.company.com/browse/PROJ-123"
                  disabled={isPending}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Link para Jira, Trello ou design.
              </FormDescription>
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
