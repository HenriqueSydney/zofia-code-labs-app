import { operationWrapper } from "@/lib/operationWrapper";
import { getClientAction } from "@/actions/clients/getClientAction";
import { AppError } from "@/errors/AppError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Mail, MapPin, Phone, Settings } from "lucide-react";
import { ClientUsers } from "./_components/ClientUsers";

interface IClientPage {
  params: Promise<{ client: string }>;
}

export default async function ClientPage({ params }: IClientPage) {
  const { client: slug } = await params;

  const [error, success] = await operationWrapper("action", "getClient", () =>
    getClientAction(slug)
  );

  if (error) {
    throw new AppError(error.message);
  }

  const client = success.client;

  return (
    <TabsContent value="overview" className="space-y-6 outline-none">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Informações Institucionais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Razão Social
                  </label>
                  <p className="font-medium">{client.companyName}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Nome Fantasia
                  </label>
                  <p className="font-medium">{client.tradeName}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    CNPJ
                  </label>
                  <p className="font-medium">{client.cnpj}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-md">
                    <Phone size={16} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Telefone
                    </label>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-md">
                    <Mail size={16} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      E-mail Financeiro
                    </label>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-md">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Endereço
                    </label>
                    <p className="font-medium text-sm">
                      {client.address || "Não informado"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Lateral: Status de Saúde/Relacionamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saúde do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground">
                  Satisfação (NPS)
                </span>
                <span className="text-2xl font-bold text-green-500">9.2</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[92%]" />
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Último contato</span>
                  <span>14/10/2023</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ticket médio</span>
                  <span>R$ 12.400,00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <ClientUsers clientSlug={slug} />
      </div>
    </TabsContent>
  );
}
