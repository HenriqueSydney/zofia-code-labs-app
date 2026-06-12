import { TabsContent } from "@/components/ui/tabs";
import { getClientData } from "../_data/getClientData";
import { ClientHealthCard } from "./_components/ClientHealthCard";
import { ClientInstitutionalInfo } from "./_components/ClientInstitutionalInfo";
import { ClientLegalResponsible } from "./_components/ClientLegalResponsible";
import { ClientUsers } from "./_components/ClientUsers";

interface IClientPage {
  params: Promise<{ client: string }>;
}

export default async function ClientPage({ params }: IClientPage) {
  const { client: slug } = await params;

  const client = await getClientData(slug);
  return (
    <TabsContent value="overview" className="space-y-6 outline-none">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <ClientInstitutionalInfo
            companyName={client.companyName}
            tradeName={client.tradeName}
            cnpj={client.cnpj}
            phone={client.phone}
            email={client.email}
            address={client.address}
          />
          <ClientLegalResponsible
            responsibleName={client.responsibleName}
            responsibleEmail={client.responsibleEmail}
            responsiblePhone={client.responsiblePhone}
          />
          <ClientHealthCard />
        </div>
        <ClientUsers clientSlug={slug} />
      </div>
    </TabsContent>
  );
}
