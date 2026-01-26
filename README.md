infisical = cofre de senha

🚀 Fase 1: O Motor de Vendas e Financeiro (Cashflow Automático)
Objetivo: Desbloquear o comercial (sua esposa) e garantir o recebimento sem intervenção manual.

- [x] CRUD de Cadastramento de Clientes

Requisito: Suporte completo a dados PJ (Razão Social, CNPJ, Endereço) para contratos.

- [x] CRUD de Cadastramento de Projetos (Rascunho & Metadados)

Requisito: Salvar valor, prazo estimado e escopo macro.

- [x] CRUD de Documentos

Requisito: Adicionar, remover e listar documentos do projeto

- [x] Criação do Fluxo de Trabalho (State Machine)

Requisito: Lógica de transição de status (Rascunho -> Análise -> Contrato -> Pagamento -> Planned).

- [/] Finalizar Sistemática de Templates (TipTap + Variáveis)

Requisito: Função "Find & Replace" no backend para injetar dados do cliente/projeto no HTML antes de gerar o PDF.

- [x] Integração do React.email (Notificações)
- [x] Email: Verificação de Conta (Magic Link/Código)
- [x] Email: Alerta de Novo Acesso (Dispositivo desconhecido)
- [x] Email: Bem vindo! Cliente cadastrado;
- [x] Email: Convite para Colaboração
- [x] Email: Bem vindo! Usuário cadastrado (confirmação para o admin);
- [x] Email: Confirmação de Alteração de Senha;
- [x] Email: Esqueceu a senha;
- [x] Email: Contrato disponibilizado para assinatura;
- [x] Email: Pendência de assinatura de contrato;
- [x] Email: Pendência de Pagamento;
- [x] Email: Cobrança de Pagamento;
- [x] Email: Comprovante de Pagamento Recebido;
- [x] Email: Nota Fiscal Emitida (NFS-e);
- [x] Email: Confirmação de aquisição de serviço adicional (analytics, segurança, ia...);
- [x] Email: Informe de início do desenvolvimento;
- [x] Email: Aguardando homologação da solução;
- [x] Email: Report de Impedimento (Blocker)
- [x] Email: Aviso de SLA Próximo do Vencimento
- [x] Email: Status Report Semanal (Resumo)
- [x] Email: Pesquisa de Satisfação (NPS)
- [x] Email: Abertura de Chamado
- [x] Email: Entrega Final do Projeto (Handover)
- [x] Email: Admin: Email de notificação de pagamento;
- [x] Email: Admin: Daily Briefing;

- [ ] Implementação dos Emails onde são chamados
- [ ] Email: Verificação de Conta (Magic Link/Código)
- [ ] Email: Alerta de Novo Acesso (Dispositivo desconhecido)
- [ ] Email: Bem vindo! Cliente cadastrado;
- [ ] Email: Convite para Colaboração
- [ ] Email: Bem vindo! Usuário cadastrado (confirmação para o admin);
- [ ] Email: Confirmação de Alteração de Senha;
- [ ] Email: Esqueceu a senha;
- [ ] Email: Contrato disponibilizado para assinatura;
- [ ] Email: Pendência de assinatura de contrato;
- [ ] Email: Pendência de Pagamento;
- [ ] Email: Cobrança de Pagamento;
- [ ] Email: Comprovante de Pagamento Recebido;
- [ ] Email: Nota Fiscal Emitida (NFS-e);
- [ ] Email: Confirmação de aquisição de serviço adicional (analytics, segurança, ia...);
- [ ] Email: Informe de início do desenvolvimento;
- [ ] Email: Aguardando homologação da solução;
- [ ] Email: Report de Impedimento (Blocker)
- [ ] Email: Aviso de SLA Próximo do Vencimento
- [ ] Email: Status Report Semanal (Resumo)
- [ ] Email: Pesquisa de Satisfação (NPS)
- [ ] Email: Abertura de Chamado
- [ ] Email: Entrega Final do Projeto (Handover)
- [ ] Email: Admin: Email de notificação de pagamento;
- [ ] Email: Admin: Daily Briefing;

- Requisito: Emails transacionais para mudança de status (ex: "Nova proposta gerada", "Projeto aprovado").

- [x] Integração com Documenso (Webhooks e Envio)

Requisito: Envio automático do PDF do contrato e escuta do webhook COMPLETED.

- [ ] Integração com Gateway de Pagamento (Mercado Pago)
- [ ] Integração com Gateway de Pagamento (Banco Inter)
- [ ] Integração com Gateway de Pagamento (Stripe)

Requisito: Gerar cobrança dos 30% de entrada após assinatura e liberar o projeto após confirmação via webhook.

🏁 MARCO: MVP READY (Uso Interno Viável) 🏁
Neste ponto, o sistema já vende, assina e cobra sozinho. O fluxo comercial está resolvido.
🔨 Fase 2: O Motor de Engenharia (Setup e Gestão)
Objetivo: Automatizar o setup técnico e organizar o escopo de entrega.

- [x] Cadastro de Observações e Backlogs
- [x] Cadastrar backlogs defaults por serviço

Requisito: Quebra do projeto em Épicos/Histórias dentro do sistema.

- [x] Cadastro de Integrações (Gerenciamento de Tokens)

Requisito: Área segura (vault) para salvar Tokens (GitHub PAT, Sonar Token, etc).

- [x] Integração com GitHub - Métricas
- [ ] Permitir integrar mais de 1 projeto ao projeto.
- [ ] Integração com GitHub (Provisionamento)
- [ ] Permitir integrar mais de 1 projeto ao projeto.

Requisito: Criação automática de repositório na Org, times e branches.

- [x] Integração com Infisical (Gestão de Segredos)

Requisito: Provisionamento automático de variáveis de ambiente do projeto.

🛡️ Fase 3: Qualidade e Governança (Diferencial)
Objetivo: Trazer visibilidade de qualidade para o painel do projeto.

- [x] Integração com SonarQube
- [ ] Permitir integrar mais de 1 projeto ao projeto.

Requisito: Exibir métricas de qualidade/coverage no dashboard.

- [ ] Integração com DefectDojo

Requisito: Exibir relatórios de vulnerabilidade.

📦 Fase 4: Expansão SaaS (Futuro)
Objetivo: Preparar para multi-tenancy real.

- [ ] CRUD de Cadastramento de Organização (Tenant)
