"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { FileText, X } from "lucide-react";
import { formatBytes } from "@/utils/formatBytes";
import { updateProjectAction } from "@/actions/projects/updateProject";
import { toast } from "sonner";
import { createProjectAction } from "@/actions/projects/createProject";
import { handleActionError } from "@/utils/handleActionError";

// Interfaces para os dados que virão do banco para popular os selects
interface ProjectFormProps {
  projectId?: string;
  clients: { id: string; companyName: string; tradeName: string | null }[];
}

export function ProjectForm({ projectId, clients }: ProjectFormProps) {
  // 1. Definição do form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      documents: [],
      clientId: "",
    },
  });

  const { setError } = form;

  // 2. Handler de submit
  async function onSubmit(data: ProjectFormValues) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("clientId", data.clientId);

    // Append dos arquivos
    data.documents.forEach((file) => {
      formData.append("documents", file);
    });
    if (projectId) {
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
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
        {/* Nome do Projeto */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cliente (Obrigatório pelo Schema) */}
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
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

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição e Escopo Inicial *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os objetivos principais e requisitos do projeto..."
                  className="resize-none"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Documentos (Dropzone) */}
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
                    multiple={true} // Requisito solicitado
                    maxFiles={5}
                    accept={{
                      "application/pdf": [".pdf"],
                      "image/*": [".png", ".jpg", ".jpeg"],
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        [".docx"],
                    }}
                  />
                  {/* Lista de Arquivos Selecionados */}
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
                                <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">
                                  {file.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatBytes(file.size)}
                                </span>
                              </div>
                            </div>

                            <Button
                              type="button" // Importante: type="button" para não submeter o form
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                // Lógica de remoção: filtra removendo o item pelo índice
                                const newFiles = field.value.filter(
                                  (_, i) => i !== index
                                );
                                field.onChange(newFiles);
                              }}
                            >
                              <X className="w-4 h-4" />
                              <span className="sr-only">Remover arquivo</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Anexe especificações técnicas, diagramas ou RFPs (Máx 5
                arquivos).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Salvar Rascunho</Button>
        </div>
      </form>
    </Form>
  );
}
