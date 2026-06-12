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
    READ_OBSERVATIONS: "project:read_observations",
    READ_RECENT_UPDATES: "project:read_recent_updates",
    MANAGE: "project:manage",
    CREATE: "project:create",
    UPDATE: "project:update",
    DELETE: "project:delete",
    ARCHIVE: "project:archive",
  },
  BACKLOG: {
    READ: "backlog:read",
    MANAGE: "backlog:manage",
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
    APPROVE: "proposal:approve",
    SEND: "proposal:send",
  },
  CONTRACT: {
    READ: "contract:read",
    CREATE: "contract:create",
    SIGN: "contract:sign",
  },
  SERVICE_CATALOG: {
    READ: "service_catalog:read",
    MANAGE: "service_catalog:manage",
  },
  SERVICE_BACKLOG: {
    READ: "service_backlog:read",
    MANAGE: "service_backlog:manage",
  },

  // --- Financial ---
  FINANCIAL: {
    VIEW_DASHBOARD: "financial:view_dashboard",
    CREATE: "financial:create",
    EXPORT: "financial:export",
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
    READ_INTEGRATIONS: "settings:read_integrations",
    MANAGE_EXPENSE_CATEGORIES: "settings:manage_expense_categories",
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
  labelKey: string;
  descriptionKey: string;
}

export interface PermissionCategory {
  key: string;
  labelKey: string;
  icon: LucideIcon;
  permissions: PermissionItem[];
}

export interface ResolvedPermissionItem {
  key: PermissionString;
  label: string;
  description: string;
}

export interface ResolvedPermissionCategory {
  key: string;
  label: string;
  icon: LucideIcon;
  permissions: ResolvedPermissionItem[];
}

function permissionItemKeys(
  key: PermissionString,
): Pick<PermissionItem, "labelKey" | "descriptionKey"> {
  const i18nKey = key.replace(":", "_");
  return {
    labelKey: `items.${i18nKey}.label`,
    descriptionKey: `items.${i18nKey}.description`,
  };
}

function permissionItem(key: PermissionString): PermissionItem {
  return {
    key,
    ...permissionItemKeys(key),
  };
}

export const PERMISSIONS_MAP: PermissionCategory[] = [
  {
    key: "projects_ecosystem",
    labelKey: "categories.projects_ecosystem",
    icon: FolderKanban,
    permissions: [
      permissionItem(PERMISSIONS.PROJECT.READ),
      permissionItem(PERMISSIONS.PROJECT.READ_OBSERVATIONS),
      permissionItem(PERMISSIONS.PROJECT.READ_RECENT_UPDATES),
      permissionItem(PERMISSIONS.PROJECT.MANAGE),
      permissionItem(PERMISSIONS.PROJECT.CREATE),
      permissionItem(PERMISSIONS.PROJECT.UPDATE),
      permissionItem(PERMISSIONS.PROJECT.ARCHIVE),
      permissionItem(PERMISSIONS.PROJECT.DELETE),
      permissionItem(PERMISSIONS.BACKLOG.READ),
      permissionItem(PERMISSIONS.BACKLOG.MANAGE),
    ],
  },
  {
    key: "crm_sales",
    labelKey: "categories.crm_sales",
    icon: Briefcase,
    permissions: [
      permissionItem(PERMISSIONS.CLIENT.READ),
      permissionItem(PERMISSIONS.CLIENT.CREATE),
      permissionItem(PERMISSIONS.CLIENT.UPDATE),
      permissionItem(PERMISSIONS.CLIENT.DELETE),
      permissionItem(PERMISSIONS.PROPOSAL.READ),
      permissionItem(PERMISSIONS.PROPOSAL.CREATE),
      permissionItem(PERMISSIONS.PROPOSAL.SEND),
      permissionItem(PERMISSIONS.PROPOSAL.APPROVE),
      permissionItem(PERMISSIONS.CONTRACT.READ),
      permissionItem(PERMISSIONS.CONTRACT.CREATE),
      permissionItem(PERMISSIONS.CONTRACT.SIGN),
    ],
  },
  {
    key: "financial",
    labelKey: "categories.financial",
    icon: Wallet,
    permissions: [
      permissionItem(PERMISSIONS.FINANCIAL.VIEW_DASHBOARD),
      permissionItem(PERMISSIONS.FINANCIAL.CREATE),
      permissionItem(PERMISSIONS.FINANCIAL.EXPORT),
      permissionItem(PERMISSIONS.INVOICE.READ),
      permissionItem(PERMISSIONS.INVOICE.CREATE),
      permissionItem(PERMISSIONS.INVOICE.CANCEL),
      permissionItem(PERMISSIONS.EXPENSE.READ),
      permissionItem(PERMISSIONS.EXPENSE.CREATE),
      permissionItem(PERMISSIONS.EXPENSE.APPROVE),
    ],
  },
  {
    key: "admin",
    labelKey: "categories.admin",
    icon: Settings,
    permissions: [
      permissionItem(PERMISSIONS.SETTINGS.MANAGE_MEMBERS),
      permissionItem(PERMISSIONS.SETTINGS.READ_INTEGRATIONS),
      permissionItem(PERMISSIONS.SETTINGS.MANAGE_INTEGRATIONS),
      permissionItem(PERMISSIONS.SETTINGS.MANAGE_BILLING),
      permissionItem(PERMISSIONS.SETTINGS.MANAGE_EXPENSE_CATEGORIES),
      permissionItem(PERMISSIONS.SERVICE_CATALOG.READ),
      permissionItem(PERMISSIONS.SERVICE_CATALOG.MANAGE),
      permissionItem(PERMISSIONS.SERVICE_BACKLOG.READ),
      permissionItem(PERMISSIONS.SERVICE_BACKLOG.MANAGE),
    ],
  },
];

// ============================================================================
// 4. HELPERS
// ============================================================================

type PermissionTranslator = (key: string) => string;

export function getPermissionsMap(
  t: PermissionTranslator,
): ResolvedPermissionCategory[] {
  return PERMISSIONS_MAP.map((category) => ({
    key: category.key,
    label: t(category.labelKey),
    icon: category.icon,
    permissions: category.permissions.map((perm) => ({
      key: perm.key,
      label: t(perm.labelKey),
      description: t(perm.descriptionKey),
    })),
  }));
}

export function getPermissionInfo(
  permissionKey: string,
  t?: PermissionTranslator,
) {
  for (const category of PERMISSIONS_MAP) {
    const found = category.permissions.find((p) => p.key === permissionKey);
    if (found) {
      if (t) {
        return {
          label: t(found.labelKey),
          description: t(found.descriptionKey),
        };
      }
      return {
        label: permissionKey,
        description: found.descriptionKey,
      };
    }
  }

  const [resource, action] = permissionKey.split(":");
  return {
    label: `${resource} - ${action}`,
    description: t ? t("fallback.description") : "Permissão do sistema",
  };
}

export function userHasPermission(
  userPermissions: string[],
  requiredPermission: PermissionString,
): boolean {
  return userPermissions.includes(requiredPermission);
}
