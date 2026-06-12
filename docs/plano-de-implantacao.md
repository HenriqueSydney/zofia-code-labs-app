# Plano de implantação — Zofia Code Labs App

Este documento descreve **como colocar em prática** a solução **Zofia Code Labs App**: aplicação web multi-organização (tenant) para unificar CRM leve, ciclo de vida de projetos, documentos comerciais (propostas e contratos com assinatura eletrônica), finanças vinculadas a projetos, dashboards e integrações (GitHub, SonarQube, Umami, Infisical, armazenamento de objetos, entre outras). Está alinhado à visão em [descricao-do-projeto.md](./descricao-do-projeto.md), [objetivo-e-justificativa.md](./objetivo-e-justificativa.md), [requisitos-nao-funcionais.md](./requisitos-nao-funcionais.md) e ao roadmap em `README.md` e `backlog.md` na raiz do repositório.

---

## 1. Contexto e objetivo da implantação

### 1.1 O que se pretende implantar

- **Fase inicial recomendada:** uso **interno** da Zofia Code Labs como organização piloto, com escopo controlado de fluxos (comercial → contrato → projeto → financeiro mínimo).
- **Horizonte evolutivo:** adoção ampliada por outras equipes e, no médio/longo prazo, evolução para **SaaS multi-tenant** com governança (RBAC, permissões granulares), conforme modelagem do produto.

### 1.2 Premissas técnicas e de ambiente

| Área | Premissa |
|------|-----------|
| Runtime | Node.js 20+ (conforme projeto) |
| Dados | PostgreSQL acessível; migrações Prisma aplicadas de forma versionada |
| Aplicação | Next.js (App Router); variáveis de ambiente validadas em `src/env` |
| Autenticação | NextAuth com segredos definidos (`AUTH_SECRET`, `JWT_TOKEN_SECRET`, etc.) |
| Arquivos | Armazenamento compatível com a configuração do projeto (ex.: Cloudflare R2 e URL pública) |
| Contratos | Documenso (API e webhooks) operacionais |
| E-mail | SMTP ou provedor configurado para notificações transacionais |
| Observabilidade | OpenTelemetry onde o deploy suportar (ver RNF de observabilidade) |

### 1.3 Critério de sucesso da implantação (nível programa)

- Usuários das áreas piloto completam os **fluxos essenciais** sem dependência de planilhas paralelas como fonte primária da verdade.
- **Integrações críticas** (Documenso, armazenamento) estáveis em produção; demais integrações ativadas conforme prioridade do rollout.
- **Backups**, acesso a logs e procedimento de rollback definidos para o ambiente de produção.

---

## 2. Stakeholders e papéis

| Papel | Responsabilidade típica |
|-------|-------------------------|
| Patrocinador / direção | Aprova orçamento, prioriza escopo do piloto e remove barreiras organizacionais |
| Dono do produto / PM | Define escopo do piloto, aceite de funcionalidades e critérios de “pronto para rollout” |
| Liderança comercial | Valida fluxos de cliente, proposta e contrato; participa do UAT comercial |
| Financeiro | Valida despesas/receitas, faturamento e relatórios; participa do UAT financeiro |
| Gestão de projetos / entrega | Valida status de projeto, backlog e integrações de engenharia |
| TI / DevOps | Ambientes, CI/CD, segredos, monitoramento, backups, desempenho e segurança operacional |
| Segurança / compliance (se existir) | Revisão de LGPD, retenção, acesso a dados e auditoria |
| Champions por área | Primeiros usuários proficientes; apoio aos colegas no dia a dia |

---

## 3. Etapas de implantação

Cada etapa deve ter **critérios de entrada** (o que precisa estar pronto antes de começar) e **critérios de saída** (o que precisa estar validado para avançar).

### 3.1 Pré-piloto (preparação)

**Objetivo:** ambiente seguro, dados de teste coerentes e integrações mínimas funcionando.

| Atividade | Detalhe |
|-----------|---------|
| Ambientes | Definir **dev**, **homologação** e **produção**; política de promoção de release (branch/tag) |
| Banco de dados | `DATABASE_URL` por ambiente; `prisma migrate` aplicado; política de **backup** e restauração ensaiada |
| Segredos | Variáveis em cofre ou gestão segura; rotação de chaves; princípio de menor privilégio (RNF-SEC) |
| Integrações obrigatórias do piloto | Documenso e armazenamento (R2) testados ponta a ponta (upload, leitura, webhook de conclusão) |
| RBAC | Validar perfis customizados, proxy de rotas e portal do cliente; completar gates na UI conforme `backlog.md` |
| Hardening básico | HTTPS, headers e revisão de superfície de ataque; validação de **IDOR** e escopo por organização em fluxos piloto |

**Saída:** checklist pré-piloto assinado por TI + dono do produto; homologação acessível aos champions.

### 3.2 Projeto piloto

**Objetivo:** provar valor com **uma organização** (tenant) e volume reduzido de projetos/clientes reais ou espelhados.

| Elemento | Sugestão |
|----------|----------|
| Duração | **4 a 8 semanas** (ajustável conforme complexidade e disponibilidade dos usuários) |
| Escopo in | Cliente PJ + responsável legal; proposta; contrato Documenso; portal do cliente (OBSERVER); transição de status; despesas/receitas; dashboards principal, financeiro e por cliente |
| Escopo out (exemplos) | Segundo tenant SaaS self-service; gateways de pagamento; orquestração completa de e-mails; provisionamento Git avançado |
| Governança do piloto | Reunião semanal de 30–60 min; registro de incidentes e “dores” em backlog priorizável |

**Saída:** ata de encerramento do piloto com lista de ajustes obrigatórios antes do rollout amplo; aprovação formal das áreas participantes.

### 3.3 Testes

| Tipo | Foco | Exemplo de evidência |
|------|------|----------------------|
| UAT por persona | Comercial, financeiro, PM | Scripts de caso de uso + capturas ou vídeos curtos |
| Integração | Webhooks, APIs terceiras | Logs idempotentes, reprocessamento sem duplicar efeitos (RNF-REL) |
| Regressão RBAC | Permissões e papéis | Matriz papel × ação × resultado esperado; testes após mudanças em “regras de autorização” (roadmap) |
| Desempenho leve | Listagens críticas | Tempo de resposta aceitável em volume esperado; paginação validada (RNF-PER) |
| Recuperação | Backup/restore | Restauração em ambiente não produtivo documentada |

**Saída:** relatório de testes com severidade de falhas; **bloqueadores** resolvidos ou mitigados com plano datado.

### 3.4 Rollout (expansão)

**Objetivo:** aumentar adoção de forma ordenada, reduzindo risco operacional e fadiga de mudança.

| Onda | Público / módulo | Observação |
|------|------------------|------------|
| 1 | Comercial + documentos | Maior impacto em receita; priorizar estabilidade de proposta/contrato |
| 2 | Financeiro | Dependência de dados comerciais e de projeto; alinhar fechamento e conciliação |
| 3 | Gestão de projetos e engenharia | Integrações (GitHub, SonarQube, Umami, Infisical) por **projeto elegível** |
| 4 | Novos tenants (se SaaS) | Onboarding, contratos legais, limites de plano e suporte |

**Critério de “piloto encerrado”:** metas do piloto atingidas ou ajustadas com novo prazo; documentação de operação mínima publicada; canal de suporte definido.

---

## 4. Cronograma sugerido (curto, médio e longo prazo)

Os marcos abaixo são **orientadores**; datas e duração devem ser preenchidas pela gestão do programa (`backlog.md` detalha itens técnicos).

### 4.1 Curto prazo (0 a 3 meses)

| Marco | Entrega típica |
|-------|----------------|
| M1 | Ambientes e pipeline de deploy estáveis |
| M2 | Piloto interno em execução com fluxo comercial + contrato + projeto |
| M3 | UAT concluído; correções de bloqueador; decisão de go/no-go para rollout onda 1 |

### 4.2 Médio prazo (3 a 9 meses)

| Marco | Entrega típica |
|-------|----------------|
| M4 | Rollout financeiro e consistência de dados entre módulos |
| M5 | Gateways de pagamento (quando priorizados no roadmap) com webhooks e reconciliação |
| M6 | Autorização granular alinhada ao RBAC em evolução; redução de risco de IDOR |
| M7 | Templates TipTap/variáveis maduros para geração de documentos em escala |

### 4.3 Longo prazo (9 a 24 meses)

| Marco | Entrega típica |
|-------|----------------|
| M8 | Expansão multi-tenant SaaS: onboarding, billing, SLAs comerciais |
| M9 | Observabilidade e SRE: SLOs de disponibilidade e latência em rotas críticas |
| M10 | LGPD operacional: bases legais, retenção, DSR e auditoria (`audit`) como rotina |

---

## 5. Recursos necessários

### 5.1 Recursos humanos (ordem de grandeza)

| Perfil | Participação no piloto | Participação pós-rollout |
|--------|------------------------|---------------------------|
| Dono do produto / PM | Meio período contínuo | Recorrente (priorização) |
| Desenvolvedor(es) full-stack | Alto durante preparação e correções | Manutenção e evolução conforme backlog |
| DevOps / TI | Pico no pré-piloto; plantão no go-live | Contínuo (menor carga) |
| Champions (comercial, financeiro, PM) | Algumas horas/semana | Apoio pontual a novos usuários |
| Suporte interno (se existir) | Planejado a partir da onda 2 | Recorrente |

*FTE exato:* a preencher pela empresa conforme tamanho da operação e escopo do piloto.

### 5.2 Recursos técnicos

| Recurso | Uso |
|---------|-----|
| Hospedagem da aplicação | Ex.: Vercel ou infraestrutura equivalente |
| PostgreSQL gerenciado ou dedicado | Produção com backup e monitoramento |
| Armazenamento de objetos | Contratos, anexos, PDFs |
| Documenso | Assinatura eletrônica e webhooks |
| E-mail transacional | Convites, pendências de assinatura, alertas operacionais |
| OpenTelemetry / agregador de traces | Diagnóstico de latência e falhas (quando disponível no deploy) |
| Repositório Git e CI | Build, testes automatizados, revisão de código |

### 5.3 Recursos financeiros

| Categoria | Observação |
|-----------|-------------|
| Infraestrutura cloud | Custo mensal estimado: **a preencher** (ambiente, DB, storage, egress) |
| Documenso / assinatura | Plano e volume de envelopes: **a preencher** |
| Domínio e e-mail | Custos anuais / mensais: **a preencher** |
| Ferramentas de observabilidade | Se além do tier gratuito: **a preencher** |
| Treinamento interno | Horas de equipe (custo de oportunidade) |

---

## 6. Plano de comunicação e treinamento

### 6.1 Comunicação

| Audiência | Mensagem-chave | Canal sugerido | Cadência |
|-----------|----------------|----------------|----------|
| Direção | Valor esperado, riscos e investimento | Reunião executiva + one-pager | Kickoff + milestone |
| Comercial / financeiro / PM | O que muda no dia a dia; onde tirar dúvidas | Kickoff + canal (chat) dedicado | Semanal no piloto; quinzenal no rollout |
| TI | Mudanças de ambiente, janelas de deploy | Runbook + chat técnico | Por release |

**Release notes internas:** resumo de funcionalidades, breaking changes e ações para o usuário (ex.: reconfigurar integração).

### 6.2 Treinamento

| Persona | Módulos sugeridos | Formato | Avaliação |
|---------|-------------------|---------|-----------|
| Comercial | Clientes PJ; propostas; contratos e assinatura | Workshop 60–90 min + guias rápidos | Checklist de proficiência (ex.: criar proposta fictícia) |
| Financeiro | Despesas/receitas; leitura de dashboards financeiros | Workshop 60 min | Exercício de lançamento e conciliação simulada |
| PM / entrega | Status de projeto; backlog; documentos | Workshop 60 min | Caso prático de mudança de status |
| Engenharia / líder técnico | Integrações; tokens; boas práticas de segurança | Sessão técnica 45–60 min | Quiz curto ou pair review com TI |

**Materiais de apoio:** um guia de **uma página por fluxo** (PDF ou wiki interna); vídeos curtos (5–10 min) para tarefas frequentes.

---

## 7. Gestão de riscos e contingência

| Risco | Impacto | Mitigação / contingência |
|-------|---------|---------------------------|
| Indisponibilidade Documenso | Atraso em contratos | Comunicar prazo alternativo; fila de retentativa de webhook; processo manual documentado temporariamente |
| Falha ou duplicidade de webhook | Estado financeiro/contrato inconsistente | Idempotência, logs estruturados, job de reconciliação e auditoria |
| Vazamento de token de integração | Segurança | Rotação imediata; revisão de permissões do PAT; treinamento de não compartilhar segredos |
| Resistência à adoção | Baixo ROI percebido | Champions, metas claras em [definicao-de-metricas-impacto.md](./definicao-de-metricas-impacto.md), simplificação do escopo do piloto |
| Performance em listagens grandes | Produtividade | Paginação, índices, revisão de N+1; priorização no backlog técnico |

---

## 8. Governança pós go-live

- **Comitê de mudança leve:** avaliar releases que afetem financeiro, contratos ou permissões.
- **Priorização:** backlog alinhado a OKRs ou metas do documento de métricas.
- **Revisão trimestral** deste plano: ajustar ondas de rollout, riscos e cronograma conforme aprendizado.

---

## 9. Referências internas

- [README.md da documentação](./README.md)
- [Arquitetura](./arquitetura.md) e [Guia de desenvolvimento](./guia-desenvolvimento.md)
- [Permissões e RBAC](./permissoes-e-rbac.md)
- [Requisitos não funcionais](./requisitos-nao-funcionais.md)
- [Definição de métricas de impacto](./definicao-de-metricas-impacto.md)
- `backlog.md` — checklist técnico vivo
