import {
  FolderKanban,
  Wallet,
  Settings,
  LucideIcon,
  Briefcase,
} from "lucide-react";

// ============================================================================
// 1. CONSTANTES (Source of Truth)
// ============================================================================
// Estrutura expandida para cobrir todos os recursos das suas Strategies.
// Padronização: "recurso:ação"

export const PERMISSIONS = {
  // --- Project Ecosystem ---
  PROJECT: {
    READ: "project:read",
    CREATE: "project:create",
    UPDATE: "project:update",
    DELETE: "project:delete",
    ARCHIVE: "project:archive",
  },
  // PROJECT_NOTES: {
  //   READ: "project_notes:read",
  //   CREATE: "project_notes:create",
  //   DELETE: "project_notes:delete",
  // },
  // DOCUMENTS: {
  //   READ: "documents:read",
  //   UPLOAD: "documents:upload",
  //   DELETE: "documents:delete",
  // },
  BACKLOG: {
    READ: "backlog:read",
    MANAGE: "backlog:manage", // Criar/Editar/Mover itens
  },

  // --- Commercial & CRM ---
  CLIENT: {
    READ: "client:read",
    CREATE: "client:create",
    UPDATE: "client:update",
    DELETE: "client:delete",
  },
  PROPOSAL: {
    READ: "proposal:read",
    CREATE: "proposal:create",
    APPROVE: "proposal:approve", // Ação específica de negócio
    SEND: "proposal:send",
  },
  CONTRACT: {
    READ: "contract:read",
    CREATE: "contract:create",
    SIGN: "contract:sign",
  },
  SERVICE_CATALOG: {
    READ: "service_catalog:read", // Ver quais serviços a empresa oferece
    MANAGE: "service_catalog:manage", // Criar/Editar os templates de serviço
  },

  // --- Financial ---
  FINANCIAL: {
    VIEW_DASHBOARD: "financial:view_dashboard",
  },
  INVOICE: {
    READ: "invoice:read",
    CREATE: "invoice:create",
    CANCEL: "invoice:cancel",
  },
  EXPENSE: {
    READ: "expense:read",
    CREATE: "expense:create",
    APPROVE: "expense:approve",
  },

  // --- Admin & Settings ---
  SETTINGS: {
    MANAGE_MEMBERS: "settings:manage_members",
    MANAGE_BILLING: "settings:manage_billing",
    MANAGE_INTEGRATIONS: "settings:manage_integrations",
  },
  DOCUMENT_TEMPLATE: {
    MANAGE: "document_template:manage", // Criar/Editar templates globais
  },
} as const;

// ============================================================================
// 2. TIPAGEM
// ============================================================================
type RecursivePermissionValues<T> = T extends string
  ? T
  : { [K in keyof T]: RecursivePermissionValues<T[K]> }[keyof T];

export type PermissionString = RecursivePermissionValues<typeof PERMISSIONS>;

// ============================================================================
// 3. MAPA DE UI (Categorias visuais)
// ============================================================================

export interface PermissionItem {
  key: PermissionString;

  label: string;

  description: string;
}

export interface PermissionCategory {
  key: string;

  label: string;

  icon: LucideIcon;

  permissions: PermissionItem[];
}

export const PERMISSIONS_MAP: PermissionCategory[] = [
  {
    key: "projects_ecosystem",
    label: "Gestão de Projetos",
    icon: FolderKanban,
    permissions: [
      {
        key: PERMISSIONS.PROJECT.READ,
        label: "Visualizar Projetos",
        description: "Permite ver a lista de projetos e seus detalhes básicos.",
      },
      {
        key: PERMISSIONS.PROJECT.CREATE,
        label: "Criar Projetos",
        description: "Permite iniciar novos projetos na organização.",
      },
      {
        key: PERMISSIONS.PROJECT.UPDATE,
        label: "Editar Projetos",
        description: "Alterar dados, datas, status e propriedades do projeto.",
      },
      {
        key: PERMISSIONS.PROJECT.ARCHIVE,
        label: "Arquivar Projetos",
        description:
          "Mover projetos concluídos para o arquivo morto (somente leitura).",
      },
      {
        key: PERMISSIONS.PROJECT.DELETE,
        label: "Excluir Projetos",
        description: "Ação destrutiva: remover projetos permanentemente.",
      },
      {
        key: PERMISSIONS.BACKLOG.READ,
        label: "Ver Backlog/Tarefas",
        description: "Acesso de leitura às tarefas e quadros do projeto.",
      },
      {
        key: PERMISSIONS.BACKLOG.MANAGE,
        label: "Gerenciar Backlog",
        description: "Criar, editar, mover e deletar tarefas/stories.",
      },
    ],
  },
  {
    key: "crm_sales",
    label: "Vendas & CRM",
    icon: Briefcase,
    permissions: [
      // --- Clientes ---
      {
        key: PERMISSIONS.CLIENT.READ,
        label: "Ver Clientes",
        description: "Acesso à base de contatos e empresas.",
      },
      {
        key: PERMISSIONS.CLIENT.CREATE,
        label: "Cadastrar Clientes",
        description: "Adicionar novos clientes ao CRM.",
      },
      {
        key: PERMISSIONS.CLIENT.UPDATE,
        label: "Editar Clientes",
        description: "Atualizar dados cadastrais de clientes existentes.",
      },
      {
        key: PERMISSIONS.CLIENT.DELETE,
        label: "Excluir Clientes",
        description: "Remover registros de clientes da base.",
      },

      // --- Propostas ---
      {
        key: PERMISSIONS.PROPOSAL.READ,
        label: "Ver Propostas",
        description: "Visualizar histórico de orçamentos.",
      },
      {
        key: PERMISSIONS.PROPOSAL.CREATE,
        label: "Criar/Editar Propostas",
        description: "Gerar novos orçamentos comerciais (Rascunhos).",
      },
      {
        key: PERMISSIONS.PROPOSAL.SEND,
        label: "Enviar Propostas",
        description: "Autorização para disparar a proposta final ao cliente.",
      },
      {
        key: PERMISSIONS.PROPOSAL.APPROVE,
        label: "Aprovar Propostas (Gestor)",
        description:
          "Permite aprovar descontos ou condições especiais e deletar propostas de terceiros.",
      },

      // --- Contratos ---
      {
        key: PERMISSIONS.CONTRACT.READ,
        label: "Ver Contratos",
        description: "Acesso às minutas e contratos vigentes.",
      },
      {
        key: PERMISSIONS.CONTRACT.CREATE,
        label: "Gerar Contratos",
        description: "Criar minutas a partir de templates.",
      },
      {
        key: PERMISSIONS.CONTRACT.SIGN,
        label: "Assinar/Finalizar",
        description:
          "Marcar contratos como assinados (bloqueia edições futuras).",
      },
    ],
  },
  {
    key: "financial",
    label: "Financeiro",
    icon: Wallet,
    permissions: [
      {
        key: PERMISSIONS.FINANCIAL.VIEW_DASHBOARD,
        label: "Dashboard Financeiro",
        description: "Visão gerencial de fluxo de caixa e totais.",
      },

      // --- Faturas (Receitas) ---
      {
        key: PERMISSIONS.INVOICE.READ,
        label: "Ver Faturas",
        description: "Acesso ao histórico de cobranças emitidas.",
      },
      {
        key: PERMISSIONS.INVOICE.CREATE,
        label: "Emitir Cobranças",
        description: "Gerar e enviar faturas/boletos para clientes.",
      },
      {
        key: PERMISSIONS.INVOICE.CANCEL,
        label: "Cancelar Faturas",
        description: "Permite anular uma nota fiscal ou cobrança emitida.",
      },

      // --- Despesas (Custos) ---
      {
        key: PERMISSIONS.EXPENSE.READ,
        label: "Ver Despesas",
        description: "Visualizar custos lançados no sistema.",
      },
      {
        key: PERMISSIONS.EXPENSE.CREATE,
        label: "Lançar Despesas",
        description: "Registrar novos custos ou solicitações de reembolso.",
      },
      {
        key: PERMISSIONS.EXPENSE.APPROVE,
        label: "Aprovar Despesas",
        description: "Autorizar o pagamento efetivo de contas.",
      },
    ],
  },
  {
    key: "admin",
    label: "Administração & Configurações",
    icon: Settings,
    permissions: [
      {
        key: PERMISSIONS.SETTINGS.MANAGE_MEMBERS,
        label: "Gerir Equipe",
        description: "Convidar membros, remover acessos e definir cargos.",
      },
      {
        key: PERMISSIONS.SETTINGS.MANAGE_INTEGRATIONS,
        label: "Integrações",
        description: "Conectar ferramentas (Slack, Stripe, etc).",
      },
      {
        key: PERMISSIONS.SETTINGS.MANAGE_BILLING,
        label: "Assinatura do Sistema",
        description: "Gerenciar plano, cartão de crédito e faturas do SaaS.",
      },
      {
        key: PERMISSIONS.DOCUMENT_TEMPLATE.MANAGE,
        label: "Templates de Documentos",
        description: "Criar e editar modelos padrões de contratos e propostas.",
      },
      // Catálogo de Serviços geralmente é configurado por Admins/Gerentes
      {
        key: PERMISSIONS.SERVICE_CATALOG.READ,
        label: "Ver Catálogo de Serviços",
        description: "Visualizar a lista de serviços padrão oferecidos.",
      },
      {
        key: PERMISSIONS.SERVICE_CATALOG.MANAGE,
        label: "Gerir Catálogo de Serviços",
        description:
          "Definir o escopo padrão dos serviços (templates de backlog).",
      },
    ],
  },
];

// ============================================================================
// 4. HELPERS
// ============================================================================

export function getPermissionInfo(permissionKey: string) {
  for (const category of PERMISSIONS_MAP) {
    const found = category.permissions.find((p) => p.key === permissionKey);
    if (found) return found;
  }
  // Fallback amigável se a permissão não estiver mapeada na UI
  const [resource, action] = permissionKey.split(":");
  return {
    label: `${resource} - ${action}`,
    description: "Permissão do sistema",
  };
}

/**
 * Helper para verificar se uma permissão existe na lista do usuário
 * Ex: userHasPermission(user.permissions, PERMISSIONS.PROJECT.CREATE)
 */
export function userHasPermission(
  userPermissions: string[],
  requiredPermission: PermissionString,
): boolean {
  return userPermissions.includes(requiredPermission);
}
