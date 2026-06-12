# Definição de métricas para avaliar o impacto da solução — Zofia Code Labs App

Este documento define **indicadores de desempenho (KPIs)** para medir o impacto da implantação do **Zofia Code Labs App**, alinhados ao objetivo de unificar comercial, financeiro e entrega ([objetivo-e-justificativa.md](./objetivo-e-justificativa.md)) e às qualidades operacionais descritas em [requisitos-nao-funcionais.md](./requisitos-nao-funcionais.md).

---

## 1. Propósito e princípios

### 1.1 Propósito

- Demonstrar **valor de negócio** (tempo, custo, qualidade da informação, satisfação).
- Acompanhar **saúde técnica** do serviço (disponibilidade, latência, erros, integrações).
- Orientar **decisões** de priorização pós-piloto e entre ondas de rollout ([plano-de-implantacao.md](./plano-de-implantacao.md)).

### 1.2 Princípios

| Princípio | Descrição |
|-----------|-----------|
| Linha de base (baseline) | Toda meta numérica deve ser comparada a um **valor medido antes** do piloto ou no início dele; sem baseline, usar “medição nas primeiras 2 semanas” como referência provisória |
| Poucos KPIs fortes | Preferir **8 a 12** indicadores bem definidos a dezenas difíceis de manter |
| Dono e frequência | Cada KPI tem **responsável** e **cadência** explícitos |
| Ação | Revisões devem gerar **itens de backlog** ou mudanças de processo quando KPI estiver vermelho |

---

## 2. Mapa de valor (problema → métrica)

| Dor organizacional (resumo) | Métrica principal sugerida |
|------------------------------|---------------------------|
| Handoff lento entre vendas e entrega | Tempo médio entre proposta aprovada e projeto em execução planejada |
| Finanças desconectada do projeto | % de projetos ativos com movimentação financeira no sistema |
| Contratos fora do sistema de registro | % de contratos formalizados via fluxo versionado + assinatura integrada |
| Ferramentas isoladas (Git, qualidade, analytics) | Taxa de adoção de integrações em projetos elegíveis |
| Retrabalho e insatisfação interna | NPS interno ou índice de incidentes de “informação incorreta/desatualizada” |
| Risco operacional do software | Disponibilidade, taxa de erro 5xx, falhas de webhook |

---

## 3. Tabela de KPIs, metas e mensuração

**Nota:** as colunas **Baseline** e parte das **Metas** são **placeholders** — a organização deve preencher com valores reais após a primeira medição. As metas exemplificadas são **ilustrativas** (estilo “reduzir em 20%…”).

| KPI | Definição | Meta (exemplo) | Baseline | Frequência | Fonte / mensuração | Responsável |
|-----|-----------|----------------|----------|------------|-------------------|-------------|
| **T1 — Tempo de handoff comercial → entrega** | Tempo médio (e mediana) entre **proposta aprovada** e o projeto no **estado operacional equivalente a execução planejada** (conforme máquina de estados do produto) | Reduzir o **tempo médio em 20%** em 90 dias após o fim do piloto | *A medir* (dados históricos ou primeiras 4 semanas do piloto) | Mensal | Timestamps em banco (CRM/projetos) ou exportação controlada; mediana recomendada para reduzir efeito de outliers | Dono do produto + PM |
| **T2 — Ciclo de assinatura de contrato** | Tempo entre **envio ao Documenso** (ou início do fluxo) e **conclusão** do webhook de assinatura | Mediana **≤ X dias úteis** (ex.: 5) ou redução de **25%** vs. baseline | *A medir* | Mensal | Logs de integração + registros de contrato; reconciliar com filas de retry | TI / PM |
| **A1 — Adoção de usuários ativos** | % de usuários convidados da organização piloto com **≥ 1 sessão/semana** em média no mês | **≥ 70%** dos convidados ativos até o fim do piloto | *A medir* | Mensal | Analytics de produto ou logs de autenticação (conforme privacidade e política interna) | Dono do produto |
| **A3 — Adoção do portal do cliente** | % de clientes com contrato ativo que possuem **≥ 1** `ClientEmployees` com login no período | **≥ 50%** após 90 dias do rollout portal | *A medir* | Mensal | `ClientEmployees` + sessões OBSERVER | PM + comercial |
| **A2 — Profundidade de uso por módulo** | % de usuários-chave que completaram **UAT** ou checklist de proficiência por persona | **100%** dos champions até a semana 4 do piloto | 0% | Quinzenal | Planilha de treinamento ou LMS interno | PM / RH interno |
| **F1 — Cobertura financeira em projetos ativos** | (Projetos ativos **com** ≥ 1 lançamento de despesa ou receita no período) / (projetos ativos no mesmo período) | **≥ 80%** após 60 dias de rollout financeiro | *A medir* | Mensal | Consultas ao schema `financial` / relatórios do dashboard financeiro | Financeiro + TI |
| **F2 — Precisão percebida dos dados** | Taxa de **correções retroativas** (ajustes manuais massivos ou reaberturas de período) em lançamentos | Reduzir **correções** em **15%** vs. baseline trimestral | *A medir* | Trimestral | Auditoria amostral + tickets internos | Financeiro |
| **D1 — Contratos no fluxo oficial** | % de novos contratos no período que passaram por **versionamento no app + Documenso** (vs. total de contratos novos registrados) | **≥ 90%** após onda 1 do rollout | *A medir* | Mensal | Contagem de contratos por origem/fluxo; política clara do que conta como “fora do sistema” | Comercial + compliance |
| **I1 — Adoção de integrações (projetos elegíveis)** | Para projetos com critério “elegível” (ex.: software entregue com repo), % com **GitHub** (e/ou Sonar, Umami) configurado e sincronizado | **≥ 75%** dos elegíveis em 6 meses | *A medir* | Mensal | Tabela de integrações por projeto; health check de sincronização | Liderança técnica |
| **I2 — Falhas de webhook** | Número de eventos de webhook **falhos** ou não processados após esgotar retentativas / número total de eventos | **< 1%** de falha mensal | *A medir* | Semanal (piloto) / Mensal | Logs estruturados + alertas; fila dead-letter se existir | TI / SRE |
| **S1 — NPS interno (ou CSAT)** | Pesquisa rápida pós-marco: “Recomendaria usar o sistema no dia a dia?” (0–10) ou escala 1–5 | NPS **≥ +20** ou CSAT **≥ 4,2/5** no fim do piloto | *A medir* | Por marco (piloto, +90 dias) | Formulário interno; opcionalmente alinhado a e-mail de pesquisa previsto no roadmap | PM |
| **S2 — Incidentes por “informação descentralizada”** | Tickets internos classificados como **dados divergentes** entre ferramentas (planilha vs. sistema) | Reduzir **20%** em 90 dias vs. baseline | *A medir* | Mensal | Classificação no helpdesk / labels em issues | Suporte + PM |
| **P1 — Tempo de resposta (latência) p95** | Percentil 95 do tempo de resposta em **rotas críticas** (lista de projetos, dashboard principal, abertura de contrato) | p95 **≤ 2 s** em condições de carga esperada (ajustar ao contexto) | *A medir* | Contínua / Semanal | APM, OpenTelemetry ou logs de tempo de request do provedor | TI |
| **P2 — Disponibilidade do serviço** | % de tempo em que a aplicação responde HTTP 2xx/3xx aceitável para uso (excluindo janela programada) | **≥ 99,5%** mensal (ajustar ao SLA desejado) | *A medir* | Mensal | Monitor sintético + métricas do host | TI / SRE |
| **P3 — Taxa de erro 5xx** | (Respostas 5xx) / (total de requisições monitoradas) | **< 0,5%** mensal | *A medir* | Semanal | Logs de servidor / APM | TI |
| **P4 — MTTR de incidente P1/P2** | Tempo médio entre detecção e **restauração** do serviço para incidentes classificados P1/P2 | Reduzir **MTTR em 25%** vs. trimestre anterior | *A medir* | Por incidente + trimestral | Registro em ferramenta de incidentes | TI |

*Opcional:* KPI de **custo operacional por projeto ativo** (infra + ferramentas / nº de projetos) — útil quando houver baseline financeiro confiável.

---

## 4. Processo de coleta e responsabilidades

| Etapa | Descrição |
|-------|-----------|
| Definição de baseline | Antes do piloto ou na **semana 1**: capturar valores atuais (processo manual, sistema legado ou primeiras medições no app) |
| Extração | Relatórios nativos (dashboards principal e financeiro), **SQL** controlado com aprovação de TI, ou exportações anonimizadas |
| Consolidação | Planilha ou BI interno; **uma fonte oficial** por KPI |
| Revisão | Reunião mensal (piloto) ou trimestral (estável) com donos dos KPIs |
| Ação | Itens de backlog ou mudança de processo quando meta for perdida por **dois ciclos consecutivos** (ajustável) |

**Privacidade:** métricas baseadas em comportamento de usuário devem respeitar **LGPD** e política interna; evitar identificar indivíduos em relatórios de gestão quando não for necessário.

---

## 5. Revisão e ciclo de melhoria

- **Piloto:** revisão **mensal** de todos os KPIs da tabela; ajuste de metas se o baseline provou irrealista.
- **Estável:** revisão **trimestral**; KPIs que não geram decisão por 2 trimestres podem ser **arquivados** ou substituídos.
- **Ligação com o plano de implantação:** ondas de rollout só avançam se KPIs **I2**, **P2** e **P3** estiverem dentro do acordo ou com plano de correção datado.

---

## 6. Referências internas

- [Plano de implantação](./plano-de-implantacao.md)
- [Objetivo e justificativa](./objetivo-e-justificativa.md)
- [Requisitos não funcionais](./requisitos-nao-funcionais.md)
- [Descrição do projeto](./descricao-do-projeto.md) — módulos que alimentam cada KPI
