"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrganizationMember } from "@/repositories/IOrganizationRepository";
import { useTranslations } from "next-intl";

interface RemoveMemberAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrganizationMember;
  orgId: string;
}

export function RemoveMemberAlertDialog({
  open,
  onOpenChange,
  member,
  orgId,
}: RemoveMemberAlertDialogProps) {
  const t = useTranslations("organization.members.remove");
  const tCommon = useTranslations("common.actions");
  const [confirmText, setConfirmText] = useState("");
  const [isPending, setIsPending] = useState(false);

  const validationText = member.name || member.email;

  useEffect(() => {
    if (!open) setConfirmText("");
  }, [open]);

  const isMatch = confirmText.trim() === validationText;

  async function handleRemove() {
    if (!isMatch) return;

    setIsPending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(t("toastSuccess"));
      onOpenChange(false);
    } catch (error) {
      toast.error(t("toastError"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {t("description", { name: validationText })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2 space-y-3">
          <Label htmlFor="confirm-removal" className="text-sm font-medium">
            {t("confirmLabel", { name: validationText })}
          </Label>
          <Input
            id="confirm-removal"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={validationText}
            className={
              !isMatch && confirmText.length > 0
                ? "border-red-300 focus-visible:ring-red-300"
                : ""
            }
            autoComplete="off"
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text/plain");
              setConfirmText(text);
            }}
          />
        </div>

        <AlertDialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={!isMatch || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("confirmButton")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
