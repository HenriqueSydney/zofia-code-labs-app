import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, CreditCard, Download, Zap, AlertTriangle } from "lucide-react";
import { operationWrapper } from "@/lib/operationWrapper";
import { getOrganizationAction } from "@/actions/organization/getOrganizationAction";
import { AppError } from "@/errors/AppError";
interface IBillingPage {
  params: Promise<{ organization: string }>;
}

export default async function OrganizationBillingPage({
  params,
}: IBillingPage) {
  const { organization: org } = await params;

  // 1. Buscamos a organização para ter contagens reais (users, projects)
  const [error, success] = await operationWrapper(
    "action",
    "getOrganization",
    () => getOrganizationAction({ organizationId: org }),
  );

  if (error) {
    throw new AppError(error.message);
  }

  const { organization } = success;

  // ===========================================================================
  // MOCK DE DADOS DE ASSINATURA
  // (Futuramente, isso virá de uma tabela 'Subscription' ou do Stripe/Gateway)
  // ===========================================================================
  const subscription = {
    planName: "Business Pro",
    status: "active", // active, past_due, canceled, trial
    amount: 299.9,
    currency: "BRL",
    nextBillingDate: new Date("2026-03-15"),
    paymentMethod: {
      brand: "Mastercard",
      last4: "4242",
      expiry: "05/28",
    },
    limits: {
      users: { total: 20, used: organization.totalOfMembers },
      projects: { total: 50, used: organization.totalOfProjects },
      storage: { total: 100, used: 45 }, // Exemplo: 100GB
    },
    invoices: [
      { id: "inv_001", date: "2026-02-15", amount: 299.9, status: "paid" },
      { id: "inv_002", date: "2026-01-15", amount: 299.9, status: "paid" },
      { id: "inv_003", date: "2025-12-15", amount: 299.9, status: "paid" },
    ],
  };

  // Helpers de UI
  const formatDate = (date: Date | string) =>
    new Intl.DateTimeFormat("pt-BR").format(new Date(date));

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const getUsagePercentage = (used: number, total: number) =>
    Math.min(Math.round((used / total) * 100), 100);

  return (
    <TabsContent value="billing" className="space-y-6 outline-none m-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ==================== COLUNA ESQUERDA: PLANO E PAGAMENTO ==================== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card do Plano Atual */}
          <Card className="border-primary/30 bg-gradient-to-br from-background to-primary/15">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {subscription.planName}
                  <Badge className="bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20">
                    Ativo
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  Renova em {formatDate(subscription.nextBillingDate)}
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">
                  {formatCurrency(subscription.amount)}
                </span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Acesso ilimitado a relatórios</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Suporte prioritário 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>API e Integrações Avançadas</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex gap-3 border-t bg-background/50 pt-6">
              <Button>Alterar Plano</Button>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
              >
                Cancelar Assinatura
              </Button>
            </CardFooter>
          </Card>

          {/* Histórico de Faturas */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Cobranças</CardTitle>
              <CardDescription>
                Baixe as faturas dos pagamentos anteriores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Fatura</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscription.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {invoice.status === "paid" ? "Pago" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* ==================== COLUNA DIREITA: CONSUMO E MÉTODO ==================== */}
        <div className="space-y-6">
          {/* Consumo de Recursos (Quotas) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-yellow-500" />
                Uso da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Usuários */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Usuários</span>
                  <span className="text-muted-foreground">
                    {subscription.limits.users.used} /{" "}
                    {subscription.limits.users.total}
                  </span>
                </div>
                <Progress
                  value={getUsagePercentage(
                    subscription.limits.users.used,
                    subscription.limits.users.total,
                  )}
                  className="h-2"
                />
              </div>

              {/* Projetos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Projetos Ativos</span>
                  <span className="text-muted-foreground">
                    {subscription.limits.projects.used} /{" "}
                    {subscription.limits.projects.total}
                  </span>
                </div>
                <Progress
                  value={getUsagePercentage(
                    subscription.limits.projects.used,
                    subscription.limits.projects.total,
                  )}
                  className="h-2"
                />
              </div>

              {/* Armazenamento (Exemplo) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Armazenamento (GB)</span>
                  <span className="text-muted-foreground">
                    {subscription.limits.storage.used} /{" "}
                    {subscription.limits.storage.total}
                  </span>
                </div>
                <Progress
                  value={getUsagePercentage(
                    subscription.limits.storage.used,
                    subscription.limits.storage.total,
                  )}
                  className="h-2"
                />
              </div>

              {/* Alerta de Limite */}
              {subscription.limits.users.used >=
                subscription.limits.users.total && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 flex gap-3 items-start text-sm text-yellow-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>
                    Você atingiu o limite de usuários. Faça upgrade para
                    adicionar mais membros.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Método de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-3 border rounded-lg bg-card/50">
                <div className="h-10 w-14 bg-muted rounded flex items-center justify-center shrink-0">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {subscription.paymentMethod.brand} terminando em{" "}
                    {subscription.paymentMethod.last4}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expira em {subscription.paymentMethod.expiry}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Atualizar Cartão
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
}
