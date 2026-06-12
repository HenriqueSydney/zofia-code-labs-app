"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Settings2,
  ExternalLink,
  TestTubeDiagonal,
  Zap,
  ZapOff,
} from "lucide-react";
import Image from "next/image";
import { IntegrationConfigForm } from "./IntegrationConfigForm";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { Integration } from "../page";
import { updateOrganizationIntegrationAction } from "@/actions/integrations/updateOrganizationIntegrationAction";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Tooltip } from "@/components/Tooltip";
import { testIntegrationConnectionAction } from "@/actions/integrations/testIntegrationConnectionAction";

export function IntegrationCard({
  integration,
  canManage,
}: {
  integration: Integration;
  canManage: boolean;
}) {
  const t = useTranslations("settings.integrations.config.card");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggleActive = (enabled: boolean) => {
    if (!canManage) return;
    if (!integration.orgIntegrationId) {
      toast.error(t("connectFirst"));
      return;
    }

    startTransition(async () => {
      const result = await updateOrganizationIntegrationAction({
        id: integration.orgIntegrationId!,
        enabled,
      });

      if (!result.success) toast.error(result.message);
      else toast.success(enabled ? t("activated") : t("deactivated"));
    });
  };

  const handleTestConnection = async () => {
    if (!canManage) return;

    if (!integration.orgIntegrationId) {
      toast.error(t("notConfigured"));
      return;
    }

    toast.info(t("testStarting"));
    const result = await testIntegrationConnectionAction(
      integration.orgIntegrationId,
    );

    toast.dismiss();
    if (!result.success) {
      toast.error(t("testFailed"));
      return;
    }

    toast.success(t("testSuccess"));
  };
  return (
    <>
      <Card className="group relative overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="relative min-w-24 min-h-24 max-w-24 max-h-24 rounded-xl bg-white flex items-center justify-center p-2 border">
                <Image
                  src={integration.logo ?? "/zofia-logo.webp"}
                  alt={integration.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="">
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <CardDescription className="mb-4">
                  <span className="line-clamp-2">
                    {integration.description}
                  </span>

                  {integration.lastSync && (
                    <>
                      <br />
                      <span>
                        <strong>{t("lastSync")} </strong>
                        {integration.lastSync}
                      </span>
                    </>
                  )}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className="cursor-help"
                variant={integration.isConnected ? "default" : "outline"}
              >
                {integration.isConnected ? (
                  <Tooltip description={t("connected")}>
                    <Zap className="w-4 h-4 cursor-help" />
                  </Tooltip>
                ) : (
                  <Tooltip description={t("disconnected")}>
                    <ZapOff className="w-4 h-4 cursor-help" />
                  </Tooltip>
                )}
              </Badge>
              {canManage && (
                <Switch
                  disabled={isPending || !integration.orgIntegrationId}
                  checked={integration.isConnected}
                  onCheckedChange={handleToggleActive}
                />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex justify-end gap-2 pt-4 border-t">
            {integration.isConnected && canManage && (
              <Button
                variant="secondary"
                onClick={handleTestConnection}
                title={t("testConnection")}
              >
                <TestTubeDiagonal className="w-4 h-4" />
              </Button>
            )}
            {canManage && (
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="hover:bg-primary hover:text-primary-foreground"
              >
                <Settings2 className="h-4 w-4" />
                {t("editConfig")}
              </Button>
            )}
            {integration.externalDocsUrl && (
              <Link href={integration.externalDocsUrl} target="_blank">
                <Button
                  variant="outline"
                  size="icon"
                  title={t("documentation")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Configuração Dinâmica */}
      {canManage && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {t("configureTitle", { name: integration.name })}
              </DialogTitle>
              <DialogDescription>{t("configureDescription")}</DialogDescription>
            </DialogHeader>

            <IntegrationConfigForm
              integration={integration}
              handleCloseModal={() => setIsModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
