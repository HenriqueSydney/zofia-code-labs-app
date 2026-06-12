import { date } from "@/lib/dayjs";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";

export type ProjectStatusEmailOverrides = {
  observation?: string;
  featureName?: string;
  version?: string;
  homologationUrl?: string;
  deadlineDate?: string;
  repoLink?: string;
  docsLink?: string;
  warrantyPeriod?: string;
  methodology?: string;
  pmName?: string;
  boardUrl?: string;
  startDate?: string;
  deliveryDate?: string;
};

function getBaseUrl(): string {
  return (
    process.env.BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function buildProjectBoardUrl(
  clientSlug: string,
  projectSlug: string,
): string {
  return `${getBaseUrl()}/clients/${clientSlug}/projects/${projectSlug}/backlog`;
}

export function buildProjectOverviewUrl(
  clientSlug: string,
  projectSlug: string,
): string {
  return `${getBaseUrl()}/clients/${clientSlug}/projects/${projectSlug}/overview`;
}

export function buildContractSignatureUrl(
  clientSlug: string,
  contractId: string,
): string {
  return `${getBaseUrl()}/clients/${clientSlug}/contracts/signature/${contractId}`;
}

export function resolveProjectStatusEmailOverrides(
  data: unknown,
): ProjectStatusEmailOverrides {
  if (!data || typeof data !== "object") {
    return {};
  }

  const record = data as Record<string, unknown>;

  return {
    observation:
      typeof record.observation === "string" ? record.observation : undefined,
    featureName:
      typeof record.featureName === "string" ? record.featureName : undefined,
    version: typeof record.version === "string" ? record.version : undefined,
    homologationUrl:
      typeof record.homologationUrl === "string"
        ? record.homologationUrl
        : undefined,
    deadlineDate:
      typeof record.deadlineDate === "string" ? record.deadlineDate : undefined,
    repoLink: typeof record.repoLink === "string" ? record.repoLink : undefined,
    docsLink: typeof record.docsLink === "string" ? record.docsLink : undefined,
    warrantyPeriod:
      typeof record.warrantyPeriod === "string"
        ? record.warrantyPeriod
        : undefined,
    methodology:
      typeof record.methodology === "string" ? record.methodology : undefined,
    pmName: typeof record.pmName === "string" ? record.pmName : undefined,
    boardUrl: typeof record.boardUrl === "string" ? record.boardUrl : undefined,
    startDate:
      typeof record.startDate === "string" ? record.startDate : undefined,
    deliveryDate:
      typeof record.deliveryDate === "string" ? record.deliveryDate : undefined,
  };
}

export function buildDefaultHomologationDeadline(): string {
  return date().add(7, "day").format("DD [de] MMMM [de] YYYY");
}

export function buildDefaultFormattedDate(): string {
  return date().format("DD [de] MMMM [de] YYYY");
}

export function buildDefaultDeliveryDate(): string {
  return date().format("DD/MM/YYYY");
}

export function getClientDisplayName(project: ProjectWithDetails): string {
  return project.client.tradeName || project.client.companyName;
}
