# Documentação — Zofia Code Labs App

Esta pasta concentra a **visão de produto**, o **levantamento de requisitos** e os **guias técnicos** da aplicação web utilizada pela **Zofia Code Labs** para acompanhar clientes, projetos, finanças e integrações operacionais.

## Índice

### Produto e requisitos

| Documento | Conteúdo |
|-----------|----------|
| [Descrição do projeto](./descricao-do-projeto.md) | Escopo de negócio, módulos, stack e limitações conhecidas |
| [Objetivo e justificativa](./objetivo-e-justificativa.md) | Problema organizacional e indicadores de sucesso |
| [Requisitos funcionais](./requisitos-funcionais.md) | Comportamentos esperados por domínio (RF-XXX) |
| [Requisitos não funcionais](./requisitos-nao-funcionais.md) | Segurança, desempenho, observabilidade, i18n (RNF-XXX) |
| [Plano de implantação](./plano-de-implantacao.md) | Piloto, testes, rollout, cronograma e treinamento |
| [Definição de métricas de impacto](./definicao-de-metricas-impacto.md) | KPIs, baseline e mensuração |

### Engenharia e operação

| Documento | Conteúdo |
|-----------|----------|
| [Arquitetura](./arquitetura.md) | Camadas, fluxo de requisição, convenções de pastas |
| [Modelo de dados](./modelo-de-dados.md) | Schemas PostgreSQL, entidades principais e relacionamentos |
| [Permissões e RBAC](./permissoes-e-rbac.md) | Constantes, strategies, proxy e portal do cliente |
| [Integrações](./integracoes.md) | Tipos suportados, configuração e métricas |
| [Guia de desenvolvimento](./guia-desenvolvimento.md) | Setup local, scripts, padrões para novas features |
| [Guia de testes](./guia-testes.md) | Vitest, In Memory repositories, specs de use cases e utils |

## Relação com o repositório

| Recurso | Local |
|---------|--------|
| Modelo de dados | `prisma/schema.prisma` |
| Roadmap e checklists | `backlog.md` e `README.md` na raiz |
| Variáveis de ambiente | `src/env/index.ts` (schema Zod) |
| Mensagens i18n | `messages/pt.json`, `messages/en.json` |
| Mapa de permissões de rotas | `src/lib/auth/routePermissionMap.ts` |

## Estado atual (resumo)

- **MVP interno** em uso: CRM, projetos, propostas/contratos (Documenso), financeiro, backlog, dashboards e integrações (GitHub, SonarQube, Umami, Infisical).
- **RBAC**: perfis customizados, permissões por membro e validação no backend (Strategy Pattern); rotas privadas validadas no `src/proxy.ts`; gates na UI ainda em evolução (`backlog.md`).
- **Portal do cliente**: usuários `TENANT_OBSERVER` com vínculo `ClientEmployees`; responsável legal obrigatório antes do envio de contrato.
- **Pendências relevantes**: orquestração dos e-mails transacionais, gateways de pagamento, billing SaaS real, convites de membros com backend completo.

Ao alterar funcionalidades, atualize o documento correspondente e marque itens **planejados** como concluíidos quando entrarem em produção.
