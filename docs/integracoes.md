# Integrações externas

O sistema trata integrações em três níveis: **tipo** (catálogo global), **organização** (credenciais do tenant) e **projeto** (vínculo operacional).

## Modelo

| Nível | Tabela | Descrição |
|-------|--------|-----------|
| Tipo | `IntegrationType` | `slug` estável usado no código (`github`, `sonarqube`, `umami`, …) |
| Org | `OrganizationIntegration` | Token/config criptografado ou referência ao cofre |
| Projeto | `ProjectIntegration` | Qual repo, site ou chave Sonar usar naquele projeto |

Factories e serviços em `src/services/` e use cases em `src/useCases/integration/`.

## Integrações suportadas (estado atual)

| Slug (típico) | Finalidade | Actions / use cases principais |
|---------------|------------|--------------------------------|
| **github** | Métricas de repositório (commits, PRs, etc.) | `getGitHubMetricsAction`, `fetchGitHubRepositoriesAction` |
| **sonarqube** | Qualidade, coverage, quality gate | `getSonarQubeMetricsAction`, `syncSonarQubeMetricsAction`, snapshots em DB |
| **umami** | Analytics web | `getUmamiMetricsAction`, `syncUmamiMetricsAction`, visitantes em tempo real |
| **infisical** | Cofre de segredos do projeto | Provisionamento de variáveis (ver backlog) |
| **documenso** | Assinatura eletrônica | Embed + webhook `/api/document-sign/webhook` |
| **storage (R2)** | Upload de documentos e logos | SDK S3 via variáveis `R2_*` em `src/env` |

Configuração de tipos e tokens: páginas em `/settings/integrations/catalog` e `/settings/integrations/config`.

## Fluxo de configuração

1. **OWNER** ou permissão `settings:manage_integrations` cadastra tipo (catálogo global, se aplicável)
2. Organização conecta integração (`connectOrganizationIntegrationAction`)
3. Projeto associa serviço/repo (`connectProjectToServiceAction`)
4. Jobs ou actions de **sync** gravam snapshots (`SonarMetricSnapshot`, `UmamiMetricSnapshot`) para gráficos históricos

## Segurança

- Tokens **nunca** retornam completos ao browser após persistidos
- Preferência por **Infisical** para segredos de equipe em produção (`backlog.md`)
- Webhook Documenso validado com `DOCUMENSO_WEBHOOK_KEY` no header `x-documenso-secret`
- APIs internas exigem `Authorization: Bearer` (exceto auth e webhook documentado)

## Teste de conexão

`testIntegrationConnectionAction` — valida credenciais antes de salvar ou após alteração.

## Planejado (roadmap)

| Integração | Status |
|------------|--------|
| Mercado Pago / Banco Inter / Stripe | Planejado — cobrança pós-assinatura |
| DefectDojo | Planejado — vulnerabilidades |
| Múltiplos repos Git por projeto | Planejado |
| Provisionamento automático de repositório GitHub | Planejado |

## Variáveis de ambiente relacionadas

Além do schema central em `src/env/index.ts`, pontos específicos podem ler:

- `DOCUMENSO_API_KEY`, `DOCUMENSO_API_URL`, `DOCUMENSO_WEBHOOK_KEY`
- `SONARQUBE_URL`, `UMAMI_API_URL`, `DEFECTDOJO_URL`
- `INFISICAL_*` (quando habilitado)
- `R2_*` para armazenamento

Lista completa de setup: `README.md` na raiz.

## Referências

- [Modelo de dados](./modelo-de-dados.md) — schema `integrations`
- [Requisitos funcionais](./requisitos-funcionais.md) — RF-INT-*
