"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { deleteOrganizationAction } from "@/actions/organization/deleteOrganizationAction";

interface OrganizationDangerZoneProps {
  orgId: string;
  orgSlug: string;
  canManage?: boolean;
}

export function OrganizationDangerZone({
  orgId,
  orgSlug,
  canManage = true,
}: OrganizationDangerZoneProps) {
  const t = useTranslations("organization.settings.dangerZone");
  const [open, setOpen] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (confirmSlug !== orgSlug) return;

    setIsPending(true);
    try {
      // TODO: Chamar Server Action
      // await deleteOrganizationAction(orgId);

      await new Promise((r) => setTimeout(r, 2000));

      toast.success(t("toastSuccess"));

      router.push("/auth/login");
    } catch (error) {
      toast.error(t("toastError"));
      setIsPending(false);
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setConfirmSlug("");
  };

  if (!canManage) {
    return null;
  }

  return (
    <Card className="border-destructive/30 mt-6">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5 gap-4">
          <div>
            <h4 className="font-medium text-destructive">
              {t("deleteOrgTitle")}
            </h4>
            <p className="text-sm text-muted-foreground max-w-[400px]">
              {t("deleteOrgDescription", { slug: orgSlug })}
            </p>
          </div>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="destructive">{t("deleteAccount")}</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  {t("dialogTitle")}
                </DialogTitle>
                <DialogDescription>{t("dialogDescription")}</DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="slug-confirm"
                    className="text-sm font-semibold"
                  >
                    {t("confirmLabel", { slug: orgSlug })}
                  </Label>
                  <Input
                    id="slug-confirm"
                    value={confirmSlug}
                    onChange={(e) => setConfirmSlug(e.target.value)}
                    placeholder={orgSlug}
                    autoComplete="off"
                    className="font-mono"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  {t("cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={confirmSlug !== orgSlug || isPending}
                  className="w-full sm:w-auto"
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("confirmDelete", { slug: orgSlug })}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
