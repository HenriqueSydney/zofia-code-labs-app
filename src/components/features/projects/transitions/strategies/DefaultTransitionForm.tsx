// src/components/features/projects/transitions/strategies/DefaultTransitionForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TransitionStrategyProps } from "../types";
import { Loader2 } from "lucide-react";
import { changeProjectStatusAction } from "@/actions/projects/changeProjectStatus"; // Certifique-se do caminho correto

export function DefaultTransitionForm({
  project,
  targetStatus,
  onSuccess,
  onCancel,
  contextData,
}: TransitionStrategyProps) {
  const [loading, setLoading] = useState(false);
  const [observation, setObservation] = useState("");

  const handleAdvance = async () => {
    setLoading(true);

    const result = await changeProjectStatusAction({
      projectId: project.id,
      newStatus: targetStatus,
      data: {
        observation: observation.trim(),
      },
    });

    setLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      // Se tiver toast configurado, prefira usar toast.error(result.error)
      alert(result.error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <p>Deseja realmente avançar o status deste projeto?</p>
        {contextData?.targetLabel && (
          <p className="mt-1">
            O projeto irá para:{" "}
            <strong className="text-foreground">
              {contextData.targetLabel}
            </strong>
          </p>
        )}
      </div>

      {/* Campo de Observação Adicionado */}
      <div className="space-y-2">
        <Label htmlFor="observation">Observações (Opcional)</Label>
        <Textarea
          id="observation"
          placeholder="Adicione um comentário ou justificativa para esta mudança..."
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          className="resize-none min-h-[100px]"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleAdvance} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmar
        </Button>
      </div>
    </div>
  );
}
