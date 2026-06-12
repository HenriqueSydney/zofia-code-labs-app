"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import { getPermissionsMap } from "@/constants/permissions";
import { OrganizationMember } from "@/repositories/IOrganizationRepository";
import { getCustomRolePermissionsAction } from "@/actions/organization/getCustomRolePermissionsAction";
import { updateMemberSpecificPermissionsAction } from "@/actions/organization/updateMemberSpecificPermissionsAction";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

// Schema simplificado: apenas o array de permissões extras
const userPermissionsSchema = z.object({
  permissions: z.array(z.string()),
});

type UserPermissionsFormData = z.infer<typeof userPermissionsSchema>;

interface GivePermissionToUserFormProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrganizationMember;
}

export function GivePermissionToUserForm({
  orgId,
  member,
  open,
  onOpenChange,
}: GivePermissionToUserFormProps) {
  const t = useTranslations("organization.members.permissions");
  const tPermissions = useTranslations("permissions");
  const tCommonActions = useTranslations("common.actions");
  const tErrors = useTranslations("errors.server");
  const { data: session, update } = useSession();
  const [isPending, setIsPending] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [inheritedPermissions, setInheritedPermissions] = useState<string[]>(
    [],
  );
  const existingExtraPermissions = member.specificPermissions;

  const userName = member.name || member.email;

  const form = useForm<UserPermissionsFormData>({
    resolver: zodResolver(userPermissionsSchema),
    defaultValues: {
      permissions: existingExtraPermissions,
    },
  });

  const permissionsMap = getPermissionsMap((key) =>
    tPermissions(key as Parameters<typeof tPermissions>[0]),
  );

  const fetchData = useCallback(async () => {
    if (!member.customRoleId) {
      return;
    }

    setIsLoadingData(true);
    try {
      const data = await getCustomRolePermissionsAction(member.customRoleId);
      setInheritedPermissions([...data.customRole.permissions]);

      // Atualiza o form com os dados novos
      form.reset({ permissions: member.specificPermissions });
    } catch (error) {
      toast.error(t("loadError"));
      onOpenChange(false);
    } finally {
      setIsLoadingData(false);
    }
  }, [member, form, onOpenChange, t]);

  // Efeito: Busca dados sempre que o modal abrir
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  // Reseta o form ao abrir para garantir dados frescos
  useEffect(() => {
    if (open) {
      form.reset({ permissions: existingExtraPermissions });
    }
  }, [open, existingExtraPermissions, form]);

  async function onSubmit(data: UserPermissionsFormData) {
    setIsPending(true);
    const result = await updateMemberSpecificPermissionsAction({
      memberId: member.id,
      permissions: data.permissions,
    });

    if (result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : tErrors("invalidData"),
      );
      setIsPending(false);
      return;
    }

    if (member.userId === session?.user?.id) {
      await update();
    }

    toast.success(t("toastSuccess"));
    onOpenChange(false);
    setIsPending(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* HEADER FIXO */}
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t.rich("description", {
              name: userName,
              strong: (chunks) => <strong>{chunks}</strong>,
              br: () => <br />,
              lockIcon: () => (
                <LockKeyhole className="inline w-3 h-3 mx-1" />
              ),
            })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* ÁREA DE ROLAGEM */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-muted/5 custom-scrollbar">
              <div className="space-y-6">
                {permissionsMap.map((category) => (
                  <div
                    key={category.key}
                    className="border rounded-lg p-4 bg-background shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <category.icon className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-sm">
                        {category.label}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.permissions.map((perm) => {
                        const isInherited = inheritedPermissions.includes(
                          perm.key,
                        );

                        return (
                          <div
                            key={perm.key}
                            className="flex flex-row items-start space-x-3 space-y-0 p-2 rounded hover:bg-muted/50 transition-colors"
                          >
                            {isInherited ? (
                              /* CASO 1: PERMISSÃO HERDADA (Checkado, Disabled e Visualmente Trancado) */
                              <>
                                <div className="flex h-5 items-center">
                                  <Checkbox checked disabled />
                                </div>
                                <div className="space-y-1 leading-none opacity-70">
                                  <div className="flex items-center gap-2">
                                    <FormLabel className="text-sm font-medium cursor-not-allowed">
                                      {perm.label}
                                    </FormLabel>
                                    <Badge
                                      variant="secondary"
                                      className="h-5 px-1.5 text-[10px] gap-1 font-normal"
                                    >
                                      <LockKeyhole className="w-3 h-3" />
                                      {t("inheritedRoleBadge")}
                                    </Badge>
                                  </div>
                                  <FormDescription className="text-xs">
                                    {perm.description}
                                  </FormDescription>
                                </div>
                              </>
                            ) : (
                              /* CASO 2: PERMISSÃO EXTRA (Controlada pelo React Hook Form) */
                              <FormField
                                control={form.control}
                                name="permissions"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 w-full">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          perm.key,
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                perm.key,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== perm.key,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm font-medium cursor-pointer">
                                        {perm.label}
                                      </FormLabel>
                                      <FormDescription className="text-xs text-muted-foreground/80">
                                        {perm.description}
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER FIXO */}
            <DialogFooter className="p-6 pt-4 border-t bg-background shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {tCommonActions("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("savePermissions")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
