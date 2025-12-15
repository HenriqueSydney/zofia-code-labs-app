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
