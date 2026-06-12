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
import { ValidationError } from "@/errors";
import { getOrganizationUiAccess } from "../_data/getOrganizationUiAccess";
import { getLocale, getTranslations } from "next-intl/server";

interface IBillingPage {
  params: Promise<{ organization: string }>;
}

export default async function OrganizationBillingPage({
  params,
}: IBillingPage) {
  const { organization: org } = await params;
  const t = await getTranslations("organization.billing");
  const locale = await getLocale();
  const { canManageBilling } = await getOrganizationUiAccess(org);

  const [error, success] = await operationWrapper(
    "action",
    "getOrganization",
    () => getOrganizationAction({ organizationId: org }),
  );

  if (error) {
    throw new ValidationError(error.message);
  }

  const { organization } = success;

  const subscription = {
    planName: "Business Pro",
    status: "active",
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
      storage: { total: 100, used: 45 },
    },
    invoices: [
      { id: "inv_001", date: "2026-02-15", amount: 299.9, status: "paid" },
      { id: "inv_002", date: "2026-01-15", amount: 299.9, status: "paid" },
      { id: "inv_003", date: "2025-12-15", amount: 299.9, status: "paid" },
    ],
  };

  const formatDate = (date: Date | string) =>
    new Intl.DateTimeFormat(locale).format(new Date(date));

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: subscription.currency,
    }).format(val);

  const getUsagePercentage = (used: number, total: number) =>
    Math.min(Math.round((used / total) * 100), 100);

  return (
    <TabsContent value="billing" className="space-y-6 outline-none m-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/30 bg-gradient-to-br from-background to-primary/15">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {subscription.planName}
                  <Badge className="bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20">
                    {t("plan.active")}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  {t("plan.renewsOn", {
                    date: formatDate(subscription.nextBillingDate),
                  })}
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">
                  {formatCurrency(subscription.amount)}
                </span>
                <span className="text-muted-foreground text-sm">
                  {t("plan.perMonth")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{t("plan.features.unlimitedReports")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{t("plan.features.prioritySupport")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{t("plan.features.apiIntegrations")}</span>
                </li>
              </ul>
            </CardContent>
            {canManageBilling && (
              <CardFooter className="flex gap-3 border-t bg-background/50 pt-6">
                <Button>{t("plan.changePlan")}</Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                >
                  {t("plan.cancelSubscription")}
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("history.title")}</CardTitle>
              <CardDescription>{t("history.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("history.columns.date")}</TableHead>
                    <TableHead>{t("history.columns.amount")}</TableHead>
                    <TableHead>{t("history.columns.status")}</TableHead>
                    <TableHead className="text-right">
                      {t("history.columns.invoice")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscription.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {invoice.status === "paid"
                            ? t("history.status.paid")
                            : t("history.status.pending")}
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-yellow-500" />
                {t("usage.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t("usage.users")}</span>
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

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t("usage.activeProjects")}</span>
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

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t("usage.storage")}</span>
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

              {subscription.limits.users.used >=
                subscription.limits.users.total && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 flex gap-3 items-start text-sm text-yellow-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{t("usage.usersLimitReached")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("paymentMethod.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-3 border rounded-lg bg-card/50">
                <div className="h-10 w-14 bg-muted rounded flex items-center justify-center shrink-0">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {t("paymentMethod.cardEnding", {
                      brand: subscription.paymentMethod.brand,
                      last4: subscription.paymentMethod.last4,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("paymentMethod.expires", {
                      expiry: subscription.paymentMethod.expiry,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {canManageBilling && (
                <Button variant="outline" className="w-full">
                  {t("paymentMethod.updateCard")}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
}
