# Objetivo e justificativa

## Objetivo

Proporcionar à **Zofia Code Labs** uma **plataforma única** para:

1. **Vender e formalizar** — do registro do cliente e da proposta até o contrato assinado, com rastreabilidade de versões e papéis (criação, revisão, aprovação).
2. **Executar e medir** — acompanhar o projeto por status, backlog, despesas/receitas e métricas de engenharia e produto (Git, qualidade, analytics).
3. **Governar o acesso** — multi-organização com membros, perfis customizados e permissões explícitas sobre ativos (projetos, contratos, catálogo, etc.).

Em síntese: **alinhar comercial, financeiro e entrega** no mesmo sistema de registro, reduzindo planilhas paralelas e comunicação informal como única fonte da verdade.

## Justificativa

### Problema de negócio

Empresas de serviços de software costumam operar com:

- **Fragmentação de ferramentas** (CRM leve, planilhas, e-mail, drive, git isolado, relatórios manuais de qualidade e analytics).
- **Gargalos no handoff** entre vendas e entrega (escopo, valores e prazos desatualizados).
- **Baixa previsibilidade financeira** quando despesas e receitas não estão ligadas ao projeto e ao estágio do ciclo de vida.
- **Risco em conformidade e rastreabilidade** quando contratos e aprovações não ficam versionados nem auditáveis no mesmo repositório lógico.

Sem um núcleo integrado, o custo de coordenação aumenta e a visão consolidada (margem por projeto, saúde da carteira, SLA) fica difícil ou tardia.

### Por que este produto

O **Zofia Code Labs App** justifica-se porque:

- **Unifica dados** de cliente, projeto, documentos e finanças sob **tenant** e políticas de acesso.
- **Automatiza pontos críticos** do fluxo (templates de documentos, assinatura via Documenso, integrações para métricas e segredos).
- **Escala o modelo** em direção a **SaaS multi-tenant**, com RBAC implementado (perfis customizados, proxy de rotas, portal do cliente) e billing em evolução.
- **Oferece portal ao cliente** para transparência de projetos e documentos, sem expor a operação interna completa da software house.

### Indicadores de sucesso (orientadores)

Estes indicadores orientam se o produto cumpre o objetivo; podem ser formalizados em métricas operacionais:

- Redução do tempo entre **proposta aprovada** e **projeto em execução planejada**.
- Percentual de projetos com **despesas e receitas** registradas no sistema vs. total ativo.
- Uso consistente de **propostas/contratos** versionados em detrimento de arquivos soltos.
- Adoção das **integrações** (Git, SonarQube, Umami) nos projetos que se beneficiam delas.
- Menos retrabalho reportado entre áreas por **falta de informação centralizada** (avaliação qualitativa ou NPS interno).

## Relação com as fases do roadmap

O `README.md` do repositório organiza o trabalho em fases (vendas/financeiro, engenharia, qualidade, expansão SaaS). Objetivo e justificativa acima são **estáveis**; as fases descrevem **como** o objetivo será alcançado ao longo do tempo.
