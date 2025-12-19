import { ProposalCreationForm } from "./toProposalGeneratedSteps/ProposalCreationForm"; // O form anterior
// import { ProposalEditor } from "./toProposalGeneratedSteps/ProposalEditor"; // Novo componente de edição
// import { ProposalReview } from "./toProposalGeneratedSteps/ProposalReview"; // Novo componente de revisão
import { TransitionStrategyProps } from "../types";
import { ProposalEditor } from "./toProposalGeneratedSteps/ProposalEditor";
import { ProposalReview } from "./toProposalGeneratedSteps/ProposalReview";
import { ProposalSendToClient } from "./toProposalGeneratedSteps/ProposalSendToClient";

export function ToProposalGenerated({
  project,
  targetStatus,
  onSuccess,
  onCancel,
  contextData,
}: TransitionStrategyProps) {
  // Verificamos o estado atual da proposta baseada nos dados do banco
  const proposal = contextData; // Assumindo que o include foi feito no backend

  // ESTÁGIO 1: Criação
  // Se não existe proposta vinculada ao projeto, mostra o formulário de criação/upload
  if (!proposal) {
    return (
      <ProposalCreationForm
        project={project}
        onSuccess={() => {
          // Recarrega a página ou invalida o cache do React Query/SWR
          // para que o componente remonte e caia no ESTÁGIO 2
          window.location.reload();
        }}
        onCancel={onCancel}
        targetStatus={targetStatus} // Passamos, mas talvez só mudemos o status no final
      />
    );
  }

  // ESTÁGIO 2: Edição (Apenas para Templates)
  // Se existe, é template e ainda não foi aprovada internamente
  if (
    proposal.sourceType === "SYSTEM_TEMPLATE" &&
    proposal.status === "DRAFT"
  ) {
    return (
      <ProposalEditor
        proposal={proposal}
        project={project}
        onApproved={onSuccess}
        contextData={contextData}
      />
    );
  }

  // // ESTÁGIO 3: Revisão/Aprovação (Para Uploads ou pós-edição)
  // // Se existe e não foi aprovada (caso de upload direto)
  if (proposal && proposal.status === "REVIEW") {
    return <ProposalReview proposal={proposal} onSuccess={onSuccess} />;
  }

  if (proposal && proposal.status === "APPROVED") {
    return (
      <ProposalSendToClient
      proposal={proposal} onSuccess={onSuccess}
      />
    );
  }

  // ESTÁGIO 4: Já Aprovado
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">
      {proposal.aprovedAt && (
        <span>
          Proposta gerada e aprovada em:{" "}
          {new Date(proposal.aprovedAt).toLocaleDateString()}.
        </span>
      )}
      {!proposal.aprovedAt && <span>Proposta gerada e aprovada</span>}
      <br />
      Aguardando envio/resposta do cliente.
    </div>
  );
}
