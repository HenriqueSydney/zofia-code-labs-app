// src/components/features/projects/transitions/strategies/ToProposalGenerated.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TransitionStrategyProps } from "../types";
import { changeProjectStatusAction } from "@/actions/projects/changeProjectStatus";

export function ToProposalGenerated({
  project,
  targetStatus,
  onSuccess,
  onCancel,
}: TransitionStrategyProps) {
  const [mode, setMode] = useState<"template" | "upload">("template");
  const [selectedTemplate, setSelectedTemplate] = useState("default-v1");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (mode === "upload" && !file) return alert("Selecione um arquivo.");

    setLoading(true);

    // Se for upload, você provavelmente faria o upload para S3/Blob aqui antes
    // e passaria apenas a URL para a action.
    // Vamos simular passando apenas metadados por enquanto.

    const transitionData = {
      proposalMethod: mode,
      templateId: mode === "template" ? selectedTemplate : undefined,
      fileName: file?.name, // Exemplo simplificado
    };

    const result = await changeProjectStatusAction({
      projectId: project.id,
      newStatus: targetStatus,
      data: transitionData,
    });

    setLoading(false);
    if (result.success) onSuccess();
    else alert(result.error);
  };

  return (
    <div className="space-y-6">
      <RadioGroup
        defaultValue="template"
        onValueChange={(v: any) => setMode(v)}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <RadioGroupItem
            value="template"
            id="template"
            className="peer sr-only"
          />
          <Label
            htmlFor="template"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            Gerar Automático (Template)
          </Label>
        </div>
        <div>
          <RadioGroupItem value="upload" id="upload" className="peer sr-only" />
          <Label
            htmlFor="upload"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            Upload de PDF Externo
          </Label>
        </div>
      </RadioGroup>

      {mode === "template" ? (
        <div className="space-y-2">
          <Label>Selecione o Modelo</Label>
          <select
            className="w-full border p-2 rounded"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="default-v1">Padrão Receita Federal</option>
            <option value="simple-v2">Simplificado</option>
          </select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Anexar Proposta Assinada/Elaborada</Label>
          <Input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Voltar
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          Concluir
        </Button>
      </div>
    </div>
  );
}
