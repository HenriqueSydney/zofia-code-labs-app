# Requisitos funcionais

Esta seção lista **requisitos funcionais** alinhados ao domínio da Zofia Code Labs App e ao estado atual do código/roadmap (atualizado com base em `backlog.md` e na implementação em maio/2026). Itens **implementados**, **parciais** ou **planejados** estão indicados explicitamente.

**Convenções**

- **RF-XXX**: identificador estável para rastreio (issues, testes, contratos).
- Prioridade sugerida: **M** (must), **S** (should), **C** (could).

---

## 1. Identidade, organização e acesso

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-AUTH-01 | M | O sistema deve permitir autenticação de usuários (sessão/credenciais compatíveis com Login/Senha e OAUTH). |
| RF-AUTH-02 | M | Dados de negócio devem ser **isolados por organização** (`Organization` / tenant). |
| RF-AUTH-03 | M | Deve existir gestão de **membros** da organização com papéis base (`MemberRole`) e opcionalmente **perfil customizado** (`CustomRole`). |
| RF-AUTH-04 | M | Operações sensíveis em recursos (projeto, proposta, contrato, catálogo, etc.) devem ser condicionadas a **permissões** verificadas no backend (Strategy Pattern em `lib/auth/strategies`). |
| RF-AUTH-05 | M | Rotas da área privada devem respeitar **mapa de permissões** no middleware (`routePermissionMap`, `proxy.ts`). |
| RF-AUTH-06 | M | **Perfis customizados** (`CustomRole`) e permissões específicas por `Member` devem compor o conjunto efetivo de permissões na sessão. |
| RF-AUTH-07 | S | Histórico de logins registrado para segurança e suporte (`LoginHistory`). |
| RF-AUTH-08 | C | **Convites** de membros com token e página pública de aceitação — *UI pronta; backend de envio/token pendente* (`backlog.md`). |
| RF-AUTH-09 | M | Usuários **portal** (`TENANT_OBSERVER`) devem acessar apenas clientes e rotas permitidas (`clientPortalRouteMap`). |

---

## 2. CRM — clientes e stakeholders

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-CRM-01 | M | Cadastro e manutenção de **clientes** com dados de PJ (razão social, nome fantasia, CNPJ, contatos, endereço conforme modelo). |
| RF-CRM-02 | M | Unicidade de cliente por **CNPJ dentro da mesma organização**. |
| RF-CRM-03 | M | Cadastro de **responsável legal** (nome, e-mail, telefone) obrigatório para envio de contrato ao Documenso (`assertClientHasResponsible`). |
| RF-CRM-04 | M | **Funcionários do cliente** (`ClientEmployees`) com papéis `ADMIN`, `USER`, `VIEWER` e convite ao portal. |
| RF-CRM-05 | S | Dashboard do cliente: estatísticas, pipeline de projetos, evolução de entrega e impedimentos (blockers). |
| RF-CRM-06 | C | Indicadores de saúde do cliente (NPS, ticket médio) — *UI placeholder em `ClientHealthCard`; dados reais pendentes*. |

---

## 3. Projetos e ciclo de vida

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-PRJ-01 | M | Criação e edição de **projetos** vinculados a um cliente da organização. |
| RF-PRJ-02 | M | Projetos devem seguir uma **máquina de estados** (`ProjectStatus`) coerente com o fluxo comercial-operacional (rascunho, análise, proposta, assinatura, pagamento de entrada, planejamento, etc.). |
| RF-PRJ-03 | M | Transições de status devem respeitar **regras de negócio** definidas nos casos de uso (ex.: não avançar sem condições atendidas). |
| RF-PRJ-04 | S | Associação de **serviços do catálogo** ao projeto e metadados necessários à precificação/execução. |
| RF-PRJ-05 | S | **Membros do projeto** (`ProjectMember`) para responsabilização e colaboração. |
| RF-PRJ-06 | S | **Notas e observações** por projeto para contexto operacional. |
| RF-PRJ-07 | S | **Documentos** anexados ou geridos no contexto do projeto (armazenamento referenciado). |

---

## 4. Propostas comerciais

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-PRP-01 | M | Criação de **propostas** por projeto com valor total, itens ligados a tipos de serviço, percentual de entrada configurável e validade. |
| RF-PRP-02 | M | Suporte a **versionamento** (`version`, `isCurrent`) e status (`ProposalStatus`: rascunho, revisão, enviada, aprovada, aceita, rejeitada, cancelada). |
| RF-PRP-03 | M | Fluxo de **revisão e aprovação** com registro de usuários e datas (`reviewedBy`, `approvedBy`, etc.). |
| RF-PRP-04 | S | Propostas podem ser geradas a partir de **templates** ou upload/manual conforme `ProposalSource`. |
| RF-PRP-05 | S | **Download/visualização** de PDF/arquivo gerado quando armazenado (URLs assinadas ou equivalentes). |

---

## 5. Contratos e assinatura eletrônica

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-CTR-01 | M | Contratos vinculados a proposta e projeto, com **status** (`ContractStatus`) e versionamento análogo à proposta. |
| RF-CTR-02 | M | Integração com **Documenso** para envio e acompanhamento de assinatura (`externalSignId`, webhooks de conclusão). |
| RF-CTR-03 | S | Templates de contrato baseados em **DocumentTemplate** com conteúdo estruturado (TipTap/JSON). |
| RF-CTR-04 | S | Papéis de permissão para **assinatura** vs. apenas leitura (`PERMISSIONS.CONTRACT.SIGN`). |

---

## 6. Catálogo de serviços e templates

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-CAT-01 | M | CRUD de **categorias** e **tipos de serviço** com preço base e vínculo organizacional. |
| RF-CAT-02 | M | CRUD de **templates de documento** por tipo (contrato, proposta, prazo de entrega, outros). |
| RF-CAT-03 | S | **Substituição de variáveis** / preparação de HTML para PDF — *parcial conforme roadmap*. |
| RF-CAT-04 | S | Definição de **backlog padrão** por tipo de serviço para acelerar o planejamento do projeto. |

---

## 7. Backlog

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-BLG-01 | M | Registro de **itens de backlog** no projeto com prioridade, pontos e ordenação. |
| RF-BLG-02 | S | Possibilidade de **instanciar** itens a partir dos defaults do serviço. |

---

## 8. Financeiro

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-FIN-01 | M | Registro de **despesas** vinculadas ao contexto adequado (projeto/organização conforme modelo). |
| RF-FIN-02 | M | **Categorias de despesa** configuráveis pela organização. |
| RF-FIN-03 | S | **Dashboard financeiro** agregando visões de receitas/despesas/orçamento conforme implementação. |
| RF-FIN-04 | S | **Faturas** ao nível da organização (`Invoice`) para evolução de billing. |
| RF-FIN-05 | C | Integração com **gateway de pagamento** (webhooks, cobrança de entrada pós-assinatura) — *planejado*: Mercado Pago, Banco Inter, Stripe. |

---

## 9. Integrações

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-INT-01 | M | Catálogo de **tipos de integração** e configuração por organização (`OrganizationIntegration`). |
| RF-INT-02 | M | Armazenamento seguro de credenciais/tokens (referências e integração com **Infisical** onde aplicável). |
| RF-INT-03 | S | **GitHub**: obtenção de métricas do repositório vinculado ao projeto. |
| RF-INT-04 | S | **SonarQube**: exibição de métricas de qualidade no painel do projeto. |
| RF-INT-05 | S | **Umami**: métricas de analytics web no contexto de métricas do projeto. |
| RF-INT-06 | C | Vários repositórios por projeto — *planejado no roadmap*. |
| RF-INT-07 | C | Provisionamento automático de repositório Git — *planejado*. |

---

## 10. Dashboards e relatórios

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-DSH-01 | M | **Dashboard principal** com visão consolidada relevante ao usuário/organização. |
| RF-DSH-02 | S | **Dashboard financeiro** organizacional. |
| RF-DSH-03 | S | Áreas de **métricas por projeto**: ciclo de vida, qualidade de código, analytics — conforme abas implementadas. |
| RF-DSH-04 | C | Relatórios de IA / analytics adicionais onde existirem rotas dedicadas (`ai-reports`, etc.) — *rotas existem; conteúdo dinâmico em evolução*. |

---

## 11. Organização (tenant) e SaaS

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-ORG-01 | M | Visualização e edição de **membros** da organização com papéis e permissões específicas. |
| RF-ORG-02 | M | CRUD de **perfis de acesso** customizados com seleção granular de permissões. |
| RF-ORG-03 | S | **Dashboard da organização** com estatísticas operacionais. |
| RF-ORG-04 | S | Tela de **billing** (plano, consumo, faturas) — *UI implementada; integração real com gateway pendente*. |
| RF-ORG-05 | C | **Criação self-service** de nova organização (onboarding SaaS) — *planejado*. |

---

## 12. Notificações

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-NOT-01 | M | Biblioteca de **templates** React Email para eventos de negócio (proposta, contrato, pagamento, SLA, NPS, etc.). |
| RF-NOT-02 | S | **Disparo automático** nos use cases e jobs (crons) conforme mudança de status — *templates prontos; ligação aos fluxos pendente* (`backlog.md`). |

---

## 13. Auditoria

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-AUD-01 | S | Registro de **auditoria** para ações relevantes (`AuditLog`), suportando conformidade e diagnóstico. |

---

## 14. Internacionalização

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RF-I18N-01 | M | Interface disponível por **locale** nas rotas `[locale]` (`pt`, `en`), com textos em `messages/*.json`. |
| RF-I18N-02 | S | Mensagens de erro de actions resolvidas com i18n (`resolveActionErrorMessage`). |

---

### Observações

- Requisitos marcados como **planejados** devem ser atualizados quando a funcionalidade entrar em produção.
- Novos RFs devem manter **coerência** com enums e modelos Prisma para evitar divergência entre documentação e implementação.
