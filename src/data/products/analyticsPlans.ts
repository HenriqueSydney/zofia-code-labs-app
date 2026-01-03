import { PricingPlan } from "@/@types/pricing";
import { Activity, BarChart3, Globe, Zap } from "lucide-react";

export const FAQ = [
  {
    question: "O Zofia Analytics utiliza cookies?",
    answer:
      "Não. Diferente do Google Analytics, utilizamos tecnologia de rastreio anônima que não armazena cookies no navegador do usuário, garantindo 100% de conformidade com a LGPD sem a necessidade de banners de consentimento.",
  },
  {
    question: "Por que os números são diferentes da Cloudflare?",
    answer:
      "A Cloudflare conta requisições brutas ao servidor (incluindo bots e scrapers). O Zofia Analytics utiliza execução via JavaScript para contar apenas visitantes humanos reais, oferecendo uma métrica muito mais precisa para o seu negócio.",
  },
  {
    question: "O script de rastreio reduz a velocidade do meu site?",
    answer:
      "De forma alguma. Nosso script possui menos de 2kb (muito menor que o GA4) e é carregado de forma assíncrona. Ele não bloqueia a renderização da página e não afeta seu score no Google PageSpeed.",
  },
  {
    question: "Posso exportar meus dados se decidir cancelar?",
    answer:
      "Sim. Seus dados pertencem a você. Oferecemos ferramentas de exportação para que você possa levar seu histórico de tráfego para onde quiser, sem qualquer tipo de 'lock-in'.",
  },
  {
    question: "Como funciona o rastreio de eventos customizados?",
    answer:
      "Você pode taguear qualquer ação no seu site, como cliques em botões de WhatsApp, downloads de PDF ou envios de formulários, utilizando uma única linha de código simples via nossa SDK ou função global.",
  },
];

export const ANALYTICS_PLAN: PricingPlan[] = [
  {
    id: "ana-starter",
    name: "Starter",
    icon: BarChart3,
    description: "Ideal para projetos individuais e validação de MVPs.",
    isIndicated: false,
    price: {
      monthly: 49,
      yearly: 490,
    },
    features: [
      { text: "1 Website/Projeto", included: true },
      { text: "Dashboard Integrado ao ERP", included: true },
      { text: "Retenção de dados: 12 meses", included: true },
      { text: "Conformidade total LGPD", included: true },
      { text: "Acesso ao Painel Umami", included: false },
    ],

    dataPoints: [
      "Visitantes Únicos e Pageviews",
      "Taxa de Rejeição e Tempo Médio",
      "Origens de Tráfego e Dispositivos",
      "Localização por País",
    ],
    highlighted: false,
    ctaVariant: "outline",
    buttonText: "Começar agora",
    metadata: {
      maxWebsites: 1,
      accessLevel: "erp_only",
      retentionMonths: 12,
    },
  },
  {
    id: "ana-growth",
    name: "Growth",
    icon: Activity,
    isIndicated: true,
    description: "Para negócios em expansão que gerenciam múltiplos domínios.",
    price: {
      monthly: 99,
      yearly: 990,
    },
    features: [
      { text: "Até 5 Websites/Projetos", included: true },
      { text: "Dashboard Integrado ao ERP", included: true },
      { text: "Retenção de dados: 24 meses", included: true },
      { text: "Relatórios semanais por e-mail", included: true },
      { text: "Acesso ao Painel Umami", included: false },
    ],
    dataPoints: [
      "Tudo do Plano Starter",
      "Relatórios Consolidados",
      "Sistemas Operacionais e Browsers",
      "Comparativo de Períodos",
    ],
    highlighted: true,
    ctaVariant: "default",
    buttonText: "Evoluir meu negócio",
    metadata: {
      maxWebsites: 5,
      accessLevel: "erp_only",
      retentionMonths: 24,
    },
  },
  {
    id: "ana-agency",
    name: "Agency Pro",
    icon: Globe,
    isIndicated: false,
    description:
      "O poder total do Analytics para agências e profissionais de tráfego.",
    price: {
      monthly: 189,
      yearly: 1890,
    },
    features: [
      { text: "Websites Ilimitados", included: true },
      { text: "Acesso Direto ao Painel Umami", included: true },
      { text: "Gestão de Equipes e Clientes", included: true },
      { text: "Retenção de dados: Vitalícia", included: true },
      { text: "Domínio customizado (CNAME)", included: true },
    ],
    dataPoints: [
      "Monitoramento em Tempo Real",
      "Rastreio de Cliques e Eventos",
      "Páginas de Entrada e Saída",
      "Localização por Cidade e Região",
      "Filtros de Segmentação Avançados",
    ],
    highlighted: false,
    ctaVariant: "outline",
    buttonText: "Escalar como Agência",
    metadata: {
      maxWebsites: -1,
      accessLevel: "full_access",
      retentionMonths: 999,
    },
  },
  {
    id: "ana-enterprise",
    name: "Enterprise",
    isIndicated: false,
    icon: Zap,
    description:
      "Soluções customizadas para Software Houses e grandes operações.",
    price: {
      monthly: 349,
      yearly: 3490,
    },
    features: [
      { text: "Tudo do plano Agency Pro", included: true },
      { text: "Acesso total à API Zofia", included: true },
      { text: "Exportação de dados brutos", included: true },
      { text: "Integração via Webhooks", included: true },
      { text: "Suporte Dedicado 24/7", included: true },
    ],
    dataPoints: [
      "Dados Brutos para BI",
      "Logs de Eventos via API",
      "Métricas Customizadas via SDK",
      "Auditoria de Acessos",
    ],
    highlighted: false,
    ctaVariant: "secondary",
    buttonText: "Falar com Consultor",
    metadata: {
      maxWebsites: -1,
      accessLevel: "api_integration",
      retentionMonths: 999,
    },
  },
];
