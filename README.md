infisical = cofre de senha

🚀 Fase 1: O Motor de Vendas e Financeiro (Cashflow Automático)
Objetivo: Desbloquear o comercial (sua esposa) e garantir o recebimento sem intervenção manual.

- [x] CRUD de Cadastramento de Clientes

Requisito: Suporte completo a dados PJ (Razão Social, CNPJ, Endereço) para contratos.

- [x] CRUD de Cadastramento de Projetos (Rascunho & Metadados)

Requisito: Salvar valor, prazo estimado e escopo macro.

- [x] CRUD de Documentos

Requisito: Adicionar, remover e listar documentos do projeto

- [/] Criação do Fluxo de Trabalho (State Machine)

Requisito: Lógica de transição de status (Rascunho -> Análise -> Contrato -> Pagamento -> Planned).

- [/] Finalizar Sistemática de Templates (TipTap + Variáveis)

Requisito: Função "Find & Replace" no backend para injetar dados do cliente/projeto no HTML antes de gerar o PDF.

- [ ] Integração do React.email (Notificações)

- Requisito: Emails transacionais para mudança de status (ex: "Nova proposta gerada", "Projeto aprovado").

- [ ] Integração com Documenso (Webhooks e Envio)

Requisito: Envio automático do PDF do contrato e escuta do webhook COMPLETED.

- [ ] Integração com Gateway de Pagamento (Mercado Pago/Stripe)

Requisito: Gerar cobrança dos 30% de entrada após assinatura e liberar o projeto após confirmação via webhook.

🏁 MARCO: MVP READY (Uso Interno Viável) 🏁
Neste ponto, o sistema já vende, assina e cobra sozinho. O fluxo comercial está resolvido.
🔨 Fase 2: O Motor de Engenharia (Setup e Gestão)
Objetivo: Automatizar o setup técnico e organizar o escopo de entrega.

- [ ] Cadastro de Observações e Backlogs

Requisito: Quebra do projeto em Épicos/Histórias dentro do sistema.

- [ ] Cadastro de Integrações (Gerenciamento de Tokens)

Requisito: Área segura (vault) para salvar Tokens (GitHub PAT, Sonar Token, etc).

- [ ] Integração com GitHub (Provisionamento)

Requisito: Criação automática de repositório na Org, times e branches.

- [ ] Integração com Infisical (Gestão de Segredos)

Requisito: Provisionamento automático de variáveis de ambiente do projeto.

🛡️ Fase 3: Qualidade e Governança (Diferencial)
Objetivo: Trazer visibilidade de qualidade para o painel do projeto.

- [ ] Integração com SonarQube

Requisito: Exibir métricas de qualidade/coverage no dashboard.

- [ ] Integração com DefectDojo

Requisito: Exibir relatórios de vulnerabilidade.

📦 Fase 4: Expansão SaaS (Futuro)
Objetivo: Preparar para multi-tenancy real.

- [ ] CRUD de Cadastramento de Organização (Tenant)

```
model ProjectWorkflowHistory {
  id          String        @id @default(cuid())

  projectId   String
  project     Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)

  // Transição
  fromStatus  ProjectStatus? // Null na criação
  toStatus    ProjectStatus

  // Quem disparou a ação? (Pode ser NULL se for System/Webhook)
  changedById String?
  changedBy   User?         @relation(fields: [changedById], references: [id])

  // O "Pulo do Gato": Metadados da transição
  // Aqui você salva IDs externos que justificaram a mudança.
  // Ex: { "documensoId": "doc_123", "rejectionReason": "Preço alto" }
  // Ex: { "paymentId": "pay_987", "gateway": "mercado_pago" }
  metadata    Json?

  createdAt   DateTime      @default(now())

  @@index([projectId])
  @@map("project_workflow_history")
}
```

```typescript
async function changeProjectStatus(
  projectId: string,
  newStatus: ProjectStatus,
  userId?: string,
  metadata?: any
) {
  return prisma.$transaction(async (tx) => {
    // 1. Pega o estado atual
    const project = await tx.project.findUniqueOrThrow({
      where: { id: projectId },
    });

    // 2. Atualiza o Projeto
    await tx.project.update({
      where: { id: projectId },
      data: { status: newStatus },
    });

    // 3. Grava o Histórico
    await tx.projectWorkflowHistory.create({
      data: {
        projectId,
        fromStatus: project.status,
        toStatus: newStatus,
        changedById: userId, // Se vier undefined, foi o Sistema
        metadata: metadata ?? {},
      },
    });
  });
}
```
