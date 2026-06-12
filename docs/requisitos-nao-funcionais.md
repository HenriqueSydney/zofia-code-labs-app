# Requisitos não funcionais

Requisitos não funcionais (RNF) descrevem **qualidades** do sistema: segurança, desempenho, disponibilidade, manutenibilidade, etc. A lista abaixo está alinhada à stack atual (Next.js 16, React 19, PostgreSQL, Prisma 7, NextAuth v5, deploy típico Vercel/standalone).

**Convenção**: **RNF-XXX**.

---

## 1. Segurança e privacidade

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RNF-SEC-01 | M | **Isolamento multi-tenant**: dados de uma organização não devem ser acessíveis por usuários de outra, exceto mecanismos explícitos de suporte (se existirem). |
| RNF-SEC-02 | M | **Autorização no servidor**: decisões de permissão não podem depender apenas da UI; validação em use cases (`checkUserPermissionForAsset`) e no **proxy de rotas** (`src/proxy.ts`). |
| RNF-SEC-03 | M | **Segredos** (tokens de integração, chaves de API) não devem ser expostos ao cliente; uso de cofre (ex.: Infisical) ou variáveis de ambiente server-side. |
| RNF-SEC-04 | M | **Senhas** armazenadas com hashing adequado (`bcryptjs` no modelo atual). |
| RNF-SEC-05 | S | **Sessões** com expiração e invalidação coerentes com NextAuth. |
| RNF-SEC-06 | S | Proteção contra **IDOR**: referências a projetos, contratos e clientes devem validar pertença à organização do usuário. |
| RNF-SEC-07 | C | **LGPD**: bases legais, minimização de dados e políticas de retenção devem ser definidas pelo negócio; o sistema deve permitir auditoria e exclusão lógica onde aplicável (`deletedAt` em várias entidades). |

---

## 2. Confiabilidade e disponibilidade

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RNF-REL-01 | M | Operações financeiras e de contrato devem ser **consistentes**: uso de transações no banco quando múltiplas tabelas forem atualizadas atomicamente. |
| RNF-REL-02 | S | **Webhooks** externos (Documenso, futuros gateways) devem ser **idempotentes** ou tratados para evitar duplicação de efeitos. |
| RNF-REL-03 | S | Indisponibilidade de integrações de terceiros deve **degradar** com mensagens claras, sem corromper estado interno. |

---

## 3. Desempenho e escalabilidade

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RNF-PER-01 | M | Consultas frequentes devem usar **índices** e filtros adequados (Prisma/PostgreSQL); revisar N+1 em listagens grandes. |
| RNF-PER-02 | S | **Paginação** ou limites em tabelas e APIs que retornam muitos registros. |
| RNF-PER-03 | S | Downloads de documentos e uploads devem usar **URLs pré-assinadas** ou streaming quando aplicável (S3), evitando proxy desnecessário de bytes grandes pelo app. |
| RNF-PER-04 | C | **Cache** de leitura para catálogos estáveis (tipos de integração, templates) onde fizer sentido. |

---

## 4. Observabilidade e operação

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RNF-OBS-01 | S | **Logging** estruturado em fluxos críticos (integrações, webhooks, erros de pagamento) — uso de `pino` ou equivalente. |
| RNF-OBS-02 | S | **OpenTelemetry** (`@vercel/otel`) para tracing em ambientes suportados, facilitando diagnóstico de latência e falhas. |
| RNF-OBS-03 | C | Métricas de negócio (conversão de proposta, tempo em status) podem ser derivadas de `AuditLog` e relatórios internos. |

---

## 5. Manutenibilidade e qualidade de código

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RNF-MNT-01 | M | Separação em **camadas** reconhecíveis: repositórios, casos de uso, actions, componentes de UI. |
| RNF-MNT-02 | M | Validação de entrada com **Zod** (ou equivalente) nas fronteiras do sistema. |
| RNF-MNT-03 | S | **TypeScript** estrito para reduzir regressões em refactors. |
| RNF-MNT-04 | S | Schema único de verdade no **Prisma 7**; client gerado em `src/generated/prisma`; migrações em `prisma/migrations`. |
| RNF-MNT-05 | S | Mensagens de erro de domínio centralizadas (`src/errors`) com resolução i18n nas Server Actions. |

---

## 6. Usabilidade e acessibilidade

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RNF-UX-01 | M | Fluxos principais (projeto, proposta, contrato, despesa) devem ser completáveis com **feedback** de erro/sucesso visível (toasts, validações de formulário). |
| RNF-UX-02 | S | Componentes baseados em **Radix** favorecem padrões acessíveis; novas telas devem manter foco, labels e estados de loading. |
| RNF-UX-03 | C | **WCAG** alvo AA em áreas críticas — progressivo conforme auditoria de UX. |

---

## 7. Internacionalização e localização

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RNF-I18N-01 | M | Textos de interface em `messages/pt.json` e `messages/en.json`; locales `pt` (padrão) e `en` em `src/i18n/routing.ts`. |
| RNF-I18N-02 | S | Formatação de **datas, números e moeda** coerente com o locale ativo (`next-intl`, `dayjs` em `lib/dayjs.ts`). |

---

## 8. Compatibilidade

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RNF-CMP-01 | S | Suporte a **navegadores modernos** (últimas versões Chrome, Firefox, Safari, Edge) para o frontend Next.js. |
| RNF-CMP-02 | C | Versões mínimas documentadas no README se houver restrições (ex.: apenas evergreen). |

---

## 9. Integrações externas

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RNF-EXT-01 | M | Chamadas HTTP a APIs externas devem ter **timeout**, tratamento de erro e não bloquear indefinidamente a UI (uso de server actions / estados assíncronos). |
| RNF-EXT-02 | S | **Retries** com backoff para falhas transitórias em jobs ou sincronizações — onde implementado. |
| RNF-EXT-03 | S | Versão das APIs externas (Documenso, GitHub, SonarQube, Umami) documentada ou encapsulada em **serviços** dedicados (`services/`). |

---

## 10. Backup, recuperação e portabilidade de dados

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RNF-DAT-01 | M | **PostgreSQL** deve ter política de backup definida pela infraestrutura (RDS, managed Postgres, etc.). |
| RNF-DAT-02 | C | Procedimento de **restore** documentado para desastres (RPO/RTO alinhados ao negócio). |

---

## 11. Evolução SaaS e licenciamento futuro

| ID | Prioridade | Requisito |
|----|------------|-----------|
| RNF-SAA-01 | S | Modelo de dados deve continuar suportando **multi-organização** sem vazamento cruzado (*defense in depth*: SQL + checagem de aplicação). |
| RNF-SAA-02 | C | **Billing**: quando integrado, falhas de pagamento devem refletir em bloqueio gradual ou aviso — conforme roadmap. |

---

### Metas mensuráveis sugeridas

Para tornar os RNF auditáveis em revisões periódicas:

| Área | Meta exemplo |
|------|----------------|
| Disponibilidade app | 99,5% mensal (ajustar ao SLA do provedor). |
| Latência API (p95) | \< 500 ms para leituras de lista paginada sob carga nominal de referência. |
| Incidentes de segurança | Zero vazamento cross-tenant em produção. |

Estas metas são **indicativas**; o prod owner / infra deve fixar valores contratuais internos.
