import { PricingPlan } from "@/@types/pricing";
import { Code2, GitBranch, ShieldCheck, Terminal } from "lucide-react";

export const FAQ = [
  {
    question: "Como o Zofia Metrics acessa meu código-fonte?",
    answer:
      "A segurança é nossa prioridade. Não clonamos seu código. A integração é feita via tokens de análise (SonarQube) e Webhooks. O processamento ocorre em nossa infraestrutura segura e apenas os metadados dos resultados são armazenados.",
  },
  {
    question: "Quais ferramentas de análise estão inclusas?",
    answer:
      "O combo inclui instâncias gerenciadas do SonarQube (Qualidade de Código), DefectDojo (Gestão de Vulnerabilidades) e integração direta com as APIs do GitHub/GitLab para métricas de produtividade (DORA Metrics).",
  },
  {
    question: "Vocês cobram por 'Developer Seat' ou por projeto?",
    answer:
      "Diferente de ferramentas como o SonarCloud, nós não cobramos por desenvolvedor. Nossos planos são baseados no número de projetos monitorados, permitindo que sua equipe cresça sem aumentar seus custos fixos.",
  },
  {
    question: "O que são as DORA Metrics incluídas no dashboard?",
    answer:
      "São os 4 indicadores fundamentais de performance DevOps: Deployment Frequency, Lead Time for Changes, Change Failure Rate e Time to Restore Service. Tudo calculado automaticamente através do histórico do seu Git.",
  },
  {
    question: "Consigo exportar relatórios para enviar aos meus clientes?",
    answer:
      "Sim. Você pode gerar relatórios de qualidade e segurança em PDF ou dar acesso direto ao Portal do Cliente (Plano Pro), onde eles podem ver a evolução técnica do projeto de forma transparente.",
  },
];

export const METRICS_PLANS: PricingPlan[] = [
  {
    id: "met-starter",
    name: "Starter Metrics",
    isIndicated: false,
    icon: GitBranch,
    description: "Visão essencial de qualidade para desenvolvedores solo.",
    price: {
      monthly: 69,
      yearly: 690,
    },
    features: [
      { text: "1 Projeto Monitorado", included: true },
      { text: "Dashboard Git (Commits/PRs)", included: true },
      { text: "Métricas SonarQube no ERP", included: true },
      { text: "Alertas de Quality Gate", included: true },
      { text: "Acesso ao SonarQube/Dojo", included: false },
    ],
    dataPoints: [
      "Volume de Commits e PRs",
      "Contagem de Bugs e Code Smells",
      "Percentual de Cobertura de Testes",
      "Status do Quality Gate (Pass/Fail)",
    ],
    highlighted: false,
    ctaVariant: "outline",
    buttonText: "Monitorar meu projeto",
    metadata: {
      maxProjects: 1,
      accessLevel: "erp_only",
      retentionMonths: 12,
    },
  },
  {
    id: "met-growth",
    name: "Growth Metrics",
    isIndicated: true,
    icon: ShieldCheck,
    description: "Gestão de produtividade e segurança para pequenas equipes.",
    price: {
      monthly: 149,
      yearly: 1490,
    },
    features: [
      { text: "Até 5 Projetos Monitorados", included: true },
      { text: "Métricas de Lead Time e Cycle Time", included: true },
      { text: "Overview de Vulnerabilidades (Dojo)", included: true },
      { text: "Relatórios de Dívida Técnica", included: true },
      { text: "Acesso às instâncias Full", included: false },
    ],
    dataPoints: [
      "Tudo do Plano Starter",
      "Vulnerabilidades por Severidade",
      "Tempo Médio de Ciclo (Git)",
      "Evolução da Dívida Técnica",
    ],
    highlighted: true,
    ctaVariant: "default",
    buttonText: "Escalar minha equipe",
    metadata: {
      maxProjects: 5,
      accessLevel: "erp_only",
      retentionMonths: 24,
    },
  },
  {
    id: "met-pro",
    name: "DevOps Pro",
    isIndicated: false,
    icon: Code2,
    description: "Controle total sobre o ciclo de vida DevSecOps.",
    price: {
      monthly: 299,
      yearly: 2990,
    },
    features: [
      { text: "Projetos Ilimitados", included: true },
      { text: "Acesso Direto ao SonarQube Full", included: true },
      { text: "Acesso Direto ao DefectDojo Full", included: true },
      { text: "Histórico de Scans Ilimitado", included: true },
      { text: "Gestão de Usuários e Equipes", included: true },
    ],
    dataPoints: [
      "Dashboard em Tempo Real",
      "Análise Profunda de Hotspots",
      "Gestão de Falsos Positivos (Dojo)",
      "Métricas de Performance de Devs",
      "Relatórios de Auditoria",
    ],
    highlighted: false,
    ctaVariant: "outline",
    buttonText: "Assumir controle total",
    metadata: {
      maxProjects: -1,
      accessLevel: "full_access",
      retentionMonths: 999,
    },
  },
  {
    id: "met-enterprise",
    name: "Enterprise Metrics",
    isIndicated: false,
    icon: Terminal,
    description: "Inteligência de dados e governança para grandes operações.",
    price: {
      monthly: 599,
      yearly: 5990,
    },
    features: [
      { text: "Tudo do plano DevOps Pro", included: true },
      { text: "Acesso via API para BI", included: true },
      { text: "Webhooks de Automação", included: true },
      { text: "SSO e Log de Auditoria", included: true },
      { text: "Consultoria em DevSecOps", included: true },
    ],
    dataPoints: [
      "Dados Brutos para Data Lake",
      "Métricas de SLA de Correção",
      "Benchmarking entre Equipes",
      "Customização de Thresholds",
    ],
    highlighted: false,
    ctaVariant: "secondary",
    buttonText: "Falar com Especialista",
    metadata: {
      maxProjects: -1,
      accessLevel: "api_integration",
      retentionMonths: 999,
    },
  },
];
