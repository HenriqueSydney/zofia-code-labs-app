"use client";

import { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, User, Briefcase } from "lucide-react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { createClientEmployeeAction } from "@/actions/clients/createClientEmployeeAction";
import { updateClientEmployeeAction } from "@/actions/clients/updateClientEmployeeAction";
import {
  createEmployeeSchema,
  EmployeeSchemaType,
} from "@/schemas/clients/employeeSchema";
import {
  clientEmployeeRoleKeys,
  getClientEmployeeRoleLabel,
} from "@/mappers/clientEmployeeRoleMapper";
import { useTranslations } from "next-intl";
import { ClientEmployeeRole } from "@/generated/prisma/enums";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";

interface IClientEmployeeFormProps {
  clientSlug: string;
  employee?: {
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    permissionRole: ClientEmployeeRole;
  };

  handleCloseModal: () => void;
}

export function ClientEmployeeForm({
  clientSlug,
  employee,
  handleCloseModal,
}: IClientEmployeeFormProps) {
  const t = useTranslations("clients.employees");
  const tRoles = useTranslations("clients.roles");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!employee;

  const schema = useMemo(
    () => createEmployeeSchema((key) => tValidation(key)),
    [tValidation],
  );

  const form = useForm<EmployeeSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: employee?.name ?? "",
      email: employee?.email ?? "",
      jobTitle: employee?.jobTitle ?? "",
      permissionRole: employee?.permissionRole ?? "USER",
    },
  });

  const onSubmit = (data: EmployeeSchemaType) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("jobTitle", data.jobTitle);
      formData.append("permissionRole", data.permissionRole);
      formData.append("clientSlug", clientSlug);

      let result;
      if (isEditing && employee) {
        result = await updateClientEmployeeAction(employee.id, formData);
      } else {
        result = await createClientEmployeeAction(formData);
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      handleCloseModal();
    });
  };

  const USER_OPTIONS = (
    Object.keys(clientEmployeeRoleKeys) as ClientEmployeeRole[]
  ).map((role) => ({
    value: role,
    label: getClientEmployeeRoleLabel(role, tRoles),
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label={t("fullName")}
          control={form.control}
          name="name"
          placeholder={t("fullNamePlaceholder")}
          disabled={isPending || isEditing}
          Icon={User}
        />

        <FormInput
          label={t("corporateEmail")}
          control={form.control}
          name="email"
          type="email"
          placeholder={t("corporateEmailPlaceholder")}
          disabled={isPending || isEditing}
          Icon={Mail}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label={t("jobTitle")}
            control={form.control}
            name="jobTitle"
            placeholder={t("jobTitlePlaceholder")}
            disabled={isPending || isEditing}
            Icon={Briefcase}
          />

          <FormSelect
            label={t("permission")}
            control={form.control}
            name="permissionRole"
            options={USER_OPTIONS}
            disabled={isPending}
            placeholder={t("selectLevel")}
          />
        </div>

        <div className="w-full flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto"
          >
            {isPending
              ? tCommon("saving")
              : isEditing
                ? t("update")
                : t("invite")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
