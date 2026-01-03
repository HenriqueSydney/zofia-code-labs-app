import { PricingPlan } from "@/@types/pricing";
import { Bot, BrainCircuit, LineChart, Sparkles } from "lucide-react";

export const FAQ = [
  {
    question: "A IA tem acesso ao meu código-fonte?",
    answer:
      "Não. Para sua segurança e privacidade, a IA analisa apenas os metadados e indicadores gerados pelos módulos de Analytics e Metrics (como bugs, vulnerabilidades e tráfego). O código-fonte nunca sai do seu ambiente.",
  },
  {
    question: "Como os relatórios são enviados para os meus clientes?",
    answer:
      "Você pode configurar o envio automático por e-mail com sua marca (White-label), disponibilizar no Portal do Cliente ou enviar alertas críticos diretamente via Slack, Teams ou WhatsApp Business.",
  },
  {
    question: "Quais modelos de inteligência artificial vocês utilizam?",
    answer:
      "Utilizamos uma combinação de modelos avançados (GPT-4o e Claude 3.5) treinados especificamente em padrões de engenharia de software e métricas de tráfego para garantir insights precisos e acionáveis.",
  },
  {
    question: "A IA consegue prever quedas no meu site?",
    answer:
      "Sim. Através da detecção de anomalias no tráfego (Analytics), a IA identifica padrões incomuns que podem indicar instabilidades no servidor ou erros de deploy antes mesmo do seu cliente perceber.",
  },
  {
    question: "Posso personalizar o tom de voz dos relatórios?",
    answer:
      "Sim. Nos planos Pro e Enterprise, você pode ajustar se prefere um relatório mais técnico (para desenvolvedores) ou mais executivo (focado em ROI e resultados de negócio para o cliente).",
  },
];

export const AI_REPORTS_PLANS: PricingPlan[] = [
  {
    id: "ai-starter",
    name: "Starter IA",
    icon: BrainCircuit,
    isIndicated: false,
    description: "Relatórios mensais inteligentes para pequenos projetos.",
    price: {
      monthly: 79,
      yearly: 790,
    },
    features: [
      { text: "1 Projeto Monitorado", included: true },
      { text: "Resumo Executivo Mensal", included: true },
      { text: "Análise de Tendências Básica", included: true },
      { text: "Notificações via E-mail", included: true },
      { text: "Detecção de Anomalias", included: false },
    ],
    dataPoints: [
      "Sumário de Performance Mensal",
      "Destaques de Crescimento",
      "Principais Pontos de Atenção",
      "Sugestões de Melhoria Simples",
    ],
    highlighted: false,
    ctaVariant: "outline",
    buttonText: "Ativar IA no meu projeto",
    metadata: {
      maxProjects: 1,
      accessLevel: "erp_only",
      retentionMonths: 12,
    },
  },
  {
    id: "ai-growth",
    name: "Growth IA",
    isIndicated: true,
    icon: Sparkles,
    description: "Análise semanal profunda para empresas em crescimento.",
    price: {
      monthly: 169,
      yearly: 1690,
    },
    features: [
      { text: "Até 5 Projetos Monitorados", included: true },
      { text: "Relatórios Estratégicos Semanais", included: true },
      { text: "Análise Preditiva de Tráfego", included: true },
      { text: "Alertas de Desvios de Comportamento", included: true },
      { text: "Insights de Segurança (Dojo)", included: true },
    ],
    dataPoints: [
      "Tudo do Plano Starter",
      "Previsão de Acessos para 7 dias",
      "Correlação: Deploy vs Performance",
      "Identificação de Gargalos de Conversão",
    ],
    highlighted: true,
    ctaVariant: "default",
    buttonText: "Evoluir com Insights",
    metadata: {
      maxProjects: 5,
      accessLevel: "erp_only",
      retentionMonths: 24,
    },
  },
  {
    id: "ai-pro",
    name: "AI Pro",
    isIndicated: false,
    icon: LineChart,
    description: "Monitoramento em tempo real com consultoria automatizada.",
    price: {
      monthly: 329,
      yearly: 3290,
    },
    features: [
      { text: "Projetos Ilimitados", included: true },
      { text: "Relatórios Diários Automatizados", included: true },
      { text: "Detecção de Anomalias em Real-time", included: true },
      { text: "Integração Slack e MS Teams", included: true },
      { text: "Consultor DevSecOps via IA", included: true },
    ],
    dataPoints: [
      "Alertas de Incidentes Imediatos",
      "Análise de Impacto de Vulnerabilidades",
      "Recomendações de Código (Sonar)",
      "Dashboard de Saúde 360º",
      "Benchmarking de Equipe",
    ],
    highlighted: false,
    ctaVariant: "outline",
    buttonText: "Assinar Consultoria IA",
    metadata: {
      maxProjects: -1,
      accessLevel: "full_access",
      retentionMonths: 999,
    },
  },
  {
    id: "ai-enterprise",
    name: "Enterprise IA",
    isIndicated: false,
    icon: Bot,
    description: "Inteligência de dados customizada e auditoria preditiva.",
    price: {
      monthly: 649,
      yearly: 6490,
    },
    features: [
      { text: "Tudo do plano AI Pro", included: true },
      { text: "Treinamento de Modelos Custom", included: true },
      { text: "Integração via API de Insights", included: true },
      { text: "Relatórios On-demand ilimitados", included: true },
      { text: "Notificações WhatsApp Business", included: true },
    ],
    dataPoints: [
      "Análise Cross-System Avançada",
      "Previsão de Riscos de Segurança",
      "Relatórios de Auditoria e Compliance",
      "Customização Total de Gatilhos",
      "Extração de Dados para Data Lake",
    ],
    highlighted: false,
    ctaVariant: "secondary",
    buttonText: "Falar com Consultor",
    metadata: {
      maxProjects: -1,
      accessLevel: "api_integration",
      retentionMonths: 999,
    },
  },
];
