# Documentação — Zofia Code Labs App

Esta pasta concentra o **levantamento de requisitos** e a **visão de produto** da aplicação web utilizada pela **Zofia Code Labs** para acompanhar projetos, finanças e integrações operacionais.

## Índice

| Documento | Conteúdo |
|-----------|------------|
| [Descrição do projeto](./descricao-do-projeto.md) | O que é o sistema, escopo de negócio, módulos principais e stack técnica observada no repositório |
| [Objetivo e justificativa](./objetivo-e-justificativa.md) | Por que o produto existe e qual problema organizacional endereça |
| [Requisitos funcionais](./requisitos-funcionais.md) | Comportamentos esperados por área (CRM, projetos, financeiro, integrações, governança) |
| [Requisitos não funcionais](./requisitos-nao-funcionais.md) | Qualidade, segurança, desempenho, observabilidade, internacionalização e evolução SaaS |

## Relação com o código

- **Modelo de dados**: `prisma/schema.prisma` (PostgreSQL com schemas `identity`, `catalog`, `crm`, `projects`, `financial`, `integrations`, `audit`).
- **Roadmap detalhado**: `README.md` na raiz do repositório (fases, marcos e itens em aberto).

Para alterações nesta documentação, mantenha consistência com o código e atualize os itens marcados como planejados quando forem implementados.
