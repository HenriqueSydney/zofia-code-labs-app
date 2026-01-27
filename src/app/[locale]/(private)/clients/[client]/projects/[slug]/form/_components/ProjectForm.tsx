"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react"; // Import necessário para as Tags

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DropzoneUpload } from "@/components/DropzoneUpload";
import {
  projectFormSchema,
  ProjectFormValues,
} from "@/schemas/projects/createProjectSchema";
import { FileText, X, Plus } from "lucide-react";
import { formatBytes } from "@/utils/formatBytes";
import { updateProjectAction } from "@/actions/projects/updateProject";
import { createProjectAction } from "@/actions/projects/createProject";
import { handleActionError } from "@/utils/handleActionError";
import { Badge } from "@/components/ui/badge"; // Import do Badge para as tags
import { priorityOptions } from "@/mappers/projectPriorityMapper";
import { toast } from "sonner";
import { date } from "@/lib/dayjs";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { FormCurrencyInput } from "@/components/form/FormCurrencyInput";
import { FormTextarea } from "@/components/form/FormTextarea";
import { FormDatePicker } from "@/components/form/FormDatePicker";
import { FormMultiFileUpload } from "@/components/form/FormMultiFileUpload";

interface ProjectFormProps {
  projectId?: string;
  clients: { id: string; companyName: string; tradeName: string | null }[];
  // Props estendidas para edição
  initialData?: Partial<ProjectFormValues>;
}

export function ProjectForm({
  projectId,
  clients,
  initialData,
}: ProjectFormProps) {
  const [tagInput, setTagInput] = useState("");

  const form = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      clientId: initialData?.clientId ?? "",
      priority: initialData?.priority ?? "MEDIUM",
      totalBudget: initialData?.totalBudget ?? 0,
      estimatedStartDate: initialData?.estimatedStartDate
        ? date(initialData.estimatedStartDate).toDate()
        : date().add(3, "days").toDate(),

      endDate: initialData?.endDate
        ? date(initialData.endDate).toDate()
        : date().add(2, "week").add(3, "days").toDate(),
      tags: initialData?.tags ?? [],
      documents: [],
    },
  });

  const { setError, setValue, getValues, watch } = form;
  const currentTags = watch("tags") || [];

  // Função auxiliar para adicionar tags
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (currentTags.includes(tagInput.trim())) {
      setTagInput(""); // Evita duplicados
      return;
    }
    const newTags = [...currentTags, tagInput.trim()];
    setValue("tags", newTags);
    setTagInput("");
  };

  const handleRemoveTag = (indexToRemove: number) => {
    const newTags = currentTags.filter((_, index) => index !== indexToRemove);
    setValue("tags", newTags);
  };

  const handleKeyDownTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Impede submit do form
      handleAddTag();
    }
  };

  async function onSubmit(data: ProjectFormValues) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("clientId", data.clientId);
    formData.append("priority", data.priority);

    // Campos Numéricos/Datas
    formData.append("totalBudget", String(data.totalBudget));
    if (data.estimatedStartDate) {
      formData.append(
        "estimatedStartDate",
        data.estimatedStartDate.toISOString(),
      );
    }

    if (data.endDate) {
      formData.append("endDate", data.endDate.toISOString());
    }

    // Arrays (Tags e Arquivos)
    data.tags?.forEach((tag) => formData.append("tags", tag));
    data.documents?.forEach((file) => formData.append("documents", file));

    try {
      if (projectId) {
        formData.append("id", projectId);
        const updateResult = await updateProjectAction(formData);
        if (updateResult?.error) {
          handleActionError(updateResult.error, setError);
          return;
        }
        return;
      }

      const result = await createProjectAction(formData);
      if (result?.error) {
        handleActionError(result.error, setError);
        return;
      }
    } catch (error: any) {
      if (error.message === "NEXT_REDIRECT") {
        return;
      }
      toast.error("Erro inesperado ao criar proposta.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* --- SEÇÃO 1: Identificação --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Nome do Projeto *"
            control={form.control}
            name="name"
            placeholder="Ex: Migração Cloud AWS"
          />

          <FormSelect
            label="Cliente *"
            control={form.control}
            disabled={!!initialData?.clientId}
            name="clientId"
            placeholder="Selecione o cliente"
            options={clients.map((client) => ({
              value: client.id,
              label: client.tradeName
                ? `${client.companyName} (${client.tradeName})`
                : client.companyName,
            }))}
          />
        </div>

        {/* --- SEÇÃO 2: Planejamento e Status --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormSelect
            label="Prioridade"
            control={form.control}
            name="priority"
            placeholder="Prioridade"
            options={priorityOptions.map((prio) => ({
              value: prio.value,
              label: prio.label,
            }))}
          />

          <FormCurrencyInput
            label="Orçamento Total (R$)"
            placeholder="R$ 0.00"
            control={form.control}
            name="totalBudget"
          />

          <FormDatePicker
            control={form.control}
            name="estimatedStartDate"
            label="Previsão de Início"
            placeholder="Selecione a data"
            minDate={date().toDate()}
          />

          <FormDatePicker
            control={form.control}
            name="endDate"
            label="Prazo Final (Deadline)"
            placeholder="Selecione a data"
            minDate={date().toDate()}
          />

          {/* Tags Input Manual */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* O segredo é envolver tudo no FormField */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>Tags</FormLabel>

                {/* Input e Botão */}
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="Tecnologia, Squad..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDownTag}
                      // Opcional: tira o foco do enter submitando o form principal
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={handleAddTag}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Lista de Tags (Visualização) */}
                {/* Usamos field.value aqui para garantir que mostramos o estado real do form */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {(field.value || []).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="gap-1 pr-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleRemoveTag(index)}
                      />
                    </Badge>
                  ))}
                </div>

                {/* Agora o erro vai aparecer aqui */}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- SEÇÃO 4: Detalhes --- */}
        <FormTextarea
          label="Descrição e Escopo Inicial *"
          control={form.control}
          name="description"
          className="resize-y custom-scrollbar"
          rows={6}
          placeholder="Descreva os objetivos principais e requisitos do projeto..."
        />

        {/* --- SEÇÃO 5: Documentos --- */}
        <FormMultiFileUpload
          control={form.control}
          name="documents"
          label="Documentos de Referência"
          description="Anexe especificações ou contratos."
          maxFiles={5}
          maxSize={10 * 1024 * 1024}
          accept={{
            "application/pdf": [".pdf"],
            "image/*": [".png", ".jpg", ".jpeg"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
              [".docx"],
          }}
        />

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" size="lg">
            {projectId ? "Salvar Alterações" : "Criar Projeto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
