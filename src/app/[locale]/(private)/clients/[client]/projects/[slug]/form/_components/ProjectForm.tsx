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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      clientId: initialData?.clientId ?? "",
      priority: initialData?.priority ?? "MEDIUM",
      totalBudget: initialData?.totalBudget ?? 0,
      estimatedStartDate: initialData?.estimatedStartDate
        ? date(initialData.estimatedStartDate).toISOString().split("T")[0]
        : "",

      endDate: initialData?.endDate
        ? date(initialData.endDate).toISOString().split("T")[0]
        : "",
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
    if (data.estimatedStartDate)
      formData.append("estimatedStartDate", data.estimatedStartDate);
    if (data.endDate) formData.append("endDate", data.endDate);

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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Projeto *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Migração Cloud AWS" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!!initialData?.clientId} // Se veio bloqueado na prop
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.companyName}{" "}
                        {client.tradeName && `(${client.tradeName})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- SEÇÃO 2: Planejamento e Status --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priorityOptions.map((prio) => (
                      <SelectItem key={prio.value} value={prio.value}>
                        {prio.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Budget */}
          <FormField
            control={form.control}
            name="totalBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orçamento Total (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    min={0}
                    step="0.01"
                    {...field}
                    onChange={(e) => {
                      // Se o campo estiver vazio, passa undefined ou 0, senão converte
                      const value =
                        e.target.value === "" ? "" : Number(e.target.value);
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
            name="estimatedStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Previsão de Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo Final (Deadline)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição e Escopo Inicial *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os objetivos principais e requisitos do projeto..."
                  className="resize-y custom-scrollbar"
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- SEÇÃO 5: Documentos --- */}
        <FormField
          control={form.control}
          name="documents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Documentos de Referência</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <DropzoneUpload
                    value={field.value}
                    onChange={field.onChange}
                    multiple={true}
                    maxFiles={5}
                    accept={{
                      "application/pdf": [".pdf"],
                      "image/*": [".png", ".jpg", ".jpeg"],
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        [".docx"],
                    }}
                  />
                  {field.value && field.value.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Arquivos selecionados ({field.value.length}):
                      </p>
                      <div className="grid gap-2">
                        {field.value.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="p-2 rounded bg-primary/10 text-primary">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col truncate">
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                  {file.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatBytes(file.size)}
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                const newFiles = field.value?.filter(
                                  (_, i) => i !== index,
                                );
                                field.onChange(newFiles);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Anexe especificações ou contratos (Máx 5 arquivos).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
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
