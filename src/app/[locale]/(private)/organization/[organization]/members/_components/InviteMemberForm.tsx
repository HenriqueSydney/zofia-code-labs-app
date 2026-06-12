"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { inviteOrganizationMemberAction } from "@/actions/organization/inviteOrganizationMemberAction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";

type RoleOption = {
  label: string;
  value: string;
};

interface InviteMemberFormProps {
  orgId: string;
  roleOptions: RoleOption[];
}

export function InviteMemberForm({
  orgId,
  roleOptions,
}: InviteMemberFormProps) {
  const t = useTranslations("organization.members.invite");
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const inviteMemberSchema = useMemo(
    () =>
      z.object({
        email: z.email(t("validation.emailInvalid")),
        name: z
          .string(t("validation.nameInvalid"))
          .min(3, { error: t("validation.nameMin") }),
        roleId: z.string().min(1, t("validation.roleRequired")),
      }),
    [t],
  );

  type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      roleId: "",
    },
  });

  async function onSubmit(data: InviteMemberFormData) {
    setIsPending(true);
    try {
      const result = await inviteOrganizationMemberAction({
        ...data,
        organizationId: orgId,
      });

      if (!result.success) {
        toast.error(result.message ?? t("toast.error"));
        return;
      }

      toast.success(
        result.message ?? t("toast.success", { email: data.email }),
      );
      setOpen(false);
      form.reset();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t("trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              control={form.control}
              name="name"
              label={t("name")}
              Icon={Mail}
            />

            <FormInput
              control={form.control}
              name="email"
              label={t("email")}
              type="email"
              placeholder={t("emailPlaceholder")}
              Icon={Mail}
            />

            <FormSelect
              label={t("role")}
              control={form.control}
              name="roleId"
              options={roleOptions}
              placeholder={t("rolePlaceholder")}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
