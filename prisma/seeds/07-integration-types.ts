import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { generateSlug } from "@/utils/generateSlug";
import { log } from "./utils";

const globalIntegrations: Omit<
  Prisma.IntegrationTypeUncheckedCreateInput,
  "slug"
>[] = [
  {
    name: "Stripe",
    description:
      "Gateway de pagamentos global para faturamento e assinaturas via Cartão, PIX e Boleto.",
    logo: "/stripe.svg",
    enableByol: false,
    externalDocsUrl: "https://dashboard.stripe.com/apikeys",
    fieldsSchema: [
      {
        key: "STRIPE_SECRET_KEY",
        label: "API Secret Key",
        keyType: "SECRET",
        type: "password",
        required: true,
      },
      {
        key: "STRIPE_WEBHOOK_SECRET",
        label: "Webhook Signing Secret",
        keyType: "SECRET",
        type: "password",
        required: false,
      },
      {
        key: "TYPE",
        label: "PAYMENT_GATEWAY",
        keyType: "TAG",
        type: "text",
        required: false,
      },
    ],
  },
  {
    name: "Mercado Pago",
    description:
      "Líder em pagamentos na América Latina. Suporta Cartão, PIX e Boleto.",
    logo: "/mercadopago.svg",
    enableByol: false,
    externalDocsUrl: "https://www.mercadopago.com.br/developers/panel/app",
    fieldsSchema: [
      {
        key: "MP_ACCESS_TOKEN",
        label: "Access Token",
        keyType: "SECRET",
        type: "password",
        required: true,
      },
      {
        key: "MP_PUBLIC_KEY",
        label: "Public Key (Front-end)",
        keyType: "PUBLIC_KEY",
        type: "text",
        required: false,
      },
      {
        key: "TYPE",
        label: "PAYMENT_GATEWAY",
        keyType: "TAG",
        type: "text",
        required: false,
      },
    ],
  },
  {
    name: "Banco Inter",
    description:
      "Banco digital brasileiro. Suporta emissão de Boletos e cobranças via PIX com autenticação mTLS.",
    logo: "/inter.svg",
    enableByol: false,
    externalDocsUrl: "https://developers.inter.co/references/token",
    fieldsSchema: [
      {
        key: "INTER_CLIENT_ID",
        label: "Client ID",
        keyType: "PUBLIC_KEY",
        type: "text",
        required: true,
      },
      {
        key: "INTER_CLIENT_SECRET",
        label: "Client Secret",
        keyType: "SECRET",
        type: "password",
        required: true,
      },
      {
        key: "INTER_CERT_PEM",
        label: "Certificado mTLS (.pem)",
        keyType: "SECRET",
        type: "password",
        required: true,
      },
      {
        key: "INTER_KEY_PEM",
        label: "Chave Privada mTLS (.pem)",
        keyType: "SECRET",
        type: "password",
        required: true,
      },
      {
        key: "INTER_PIX_KEY",
        label: "Chave PIX",
        keyType: "PUBLIC_KEY",
        type: "text",
        required: false,
      },
      {
        key: "TYPE",
        label: "PAYMENT_GATEWAY",
        keyType: "TAG",
        type: "text",
        required: false,
      },
    ],
  },
  {
    name: "Umami Analytics",
    description:
      "Análise de web de código aberto, focada em privacidade e simples de usar.",
    logo: "/umami.png",
    enableByol: true,
    externalDocsUrl: "https://umami.is/docs/api",
    fieldsSchema: [
      {
        key: "UMAMI_API_URL",
        label: "API URL",
        keyType: "PUBLIC_KEY",
        type: "url",
        required: true,
        dependsOnByol: true,
      },
      {
        key: "UMAMI_ADMIN_USER",
        label: "Admin Username",
        keyType: "PUBLIC_KEY",
        type: "text",
        required: true,
      },
      {
        key: "UMAMI_ADMIN_PASSWORD",
        label: "Admin Password",
        keyType: "SECRET",
        type: "password",
        required: true,
      },
    ],
  },
  {
    name: "SonarQube",
    description:
      "Monitoramento de qualidade de código, bugs, vulnerabilidades e dívida técnica.",
    logo: "/sonarqube.svg",
    enableByol: true,
    fieldsSchema: [
      {
        key: "SONARQUBE_URL",
        label: "Sonar Instance URL",
        keyType: "PUBLIC_KEY",
        type: "url",
        required: true,
        dependsOnByol: true,
      },
      {
        key: "SONARQUBE_TOKEN",
        label: "User Analysis Token",
        keyType: "SECRET",
        type: "password",
        required: true,
      },
    ],
  },
  {
    name: "DefectDojo",
    description:
      "Orquestração de segurança e agregação de vulnerabilidades (ASOC).",
    logo: "/defectdojo.webp",
    enableByol: true,
    fieldsSchema: [
      {
        key: "DEFECTDOJO_URL",
        label: "API V2 URL",
        keyType: "PUBLIC_KEY",
        type: "url",
        required: true,
        dependsOnByol: true,
      },
      {
        key: "DEFECTDOJO_API_KEY",
        label: "API Key",
        keyType: "SECRET",
        type: "password",
        required: true,
      },
    ],
  },
  {
    name: "GitHub",
    description:
      "Conexão para extração de métricas de produtividade e automação de repositórios.",
    logo: "/github.png",
    enableByol: false,
    externalDocsUrl: "https://docs.github.com/en/rest",
    fieldsSchema: [
      {
        key: "GITHUB_ACCESS_TOKEN",
        label: "Personal Access Token",
        keyType: "SECRET",
        type: "password",
        required: true,
      },
      {
        key: "GITHUB_ORG_NAME",
        label: "Organization/User Name",
        keyType: "PUBLIC_KEY",
        type: "text",
        required: true,
      },
    ],
  },
  {
    name: "Resend",
    description:
      "Plataforma de e-mails para desenvolvedores. Envio transacional com alta taxa de entrega.",
    logo: "/resend.svg",
    enableByol: false,
    fieldsSchema: [
      {
        key: "RESEND_API_KEY",
        label: "API Key",
        keyType: "SECRET",
        type: "password",
        required: true,
      },
      {
        key: "RESEND_FROM_EMAIL",
        label: "E-mail de Remetente (Ex: no-reply@zofiacodelabs.com)",
        keyType: "PUBLIC_KEY",
        type: "email",
        required: true,
      },
    ],
  },
];

export async function seedIntegrationTypes(
  prisma: PrismaClient,
): Promise<void> {
  log("🔌 Sincronizando catálogo de integrações...");

  for (const integration of globalIntegrations) {
    const slug = generateSlug({ title: integration.name });
    await prisma.integrationType.upsert({
      where: { slug },
      update: integration,
      create: { ...integration, slug },
    });
    log(`   ✅ Integração: ${integration.name}`);
  }
}
