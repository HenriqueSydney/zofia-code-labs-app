import { TabsContent } from "@/components/ui/tabs";
import { operationWrapper } from "@/lib/operationWrapper";
import { getOrganizationAction } from "@/actions/organization/getOrganizationAction";
import { ValidationError } from "@/errors";
import { OrganizationSettingsForm } from "./_components/OrganizationSettingsForm";
import { OrganizationDangerZone } from "./_components/OrganizationDangerZone";
import { getOrganizationUiAccess } from "../_data/getOrganizationUiAccess";

interface OrganizationSettingsPageProps {
  params: Promise<{ organization: string }>;
}

export default async function OrganizationSettingsPage({
  params,
}: OrganizationSettingsPageProps) {
  const { organization: org } = await params;
  const { canManageMembers } = await getOrganizationUiAccess(org);

  const [error, success] = await operationWrapper(
    "action",
    "getOrganization",
    () => getOrganizationAction({ organizationId: org }),
  );

  if (error) {
    throw new ValidationError(error.message);
  }

  const { organization } = success;

  return (
    <TabsContent value="settings" className="space-y-6 outline-none m-0">
      <div className="mx-auto">
        <OrganizationSettingsForm
          initialData={organization}
          canEdit={canManageMembers}
        />
        <OrganizationDangerZone
          orgId={organization.id}
          orgSlug={organization.slug}
          canManage={canManageMembers}
        />
      </div>
    </TabsContent>
  );
}
