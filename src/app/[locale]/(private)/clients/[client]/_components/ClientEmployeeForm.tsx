"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, User, Briefcase } from "lucide-react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

// Importe suas novas actions aqui
import { createClientEmployeeAction } from "@/actions/clients/createClientEmployeeAction";
import { updateClientEmployeeAction } from "@/actions/clients/updateClientEmployeeAction";
import {
  employeeSchema,
  EmployeeSchemaType,
} from "@/schemas/clients/employeeSchema";
import { ClientEmployeeRoleMapper } from "@/mappers/clientEmployeeMappers";
import { ClientEmployeeRole } from "@/generated/prisma/enums";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";

interface IClientEmployeeFormProps {
  clientSlug: string; // ID fixo vindo do contexto do cliente
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
  const [isPending, startTransition] = useTransition();
  const isEditing = !!employee;

  const form = useForm<EmployeeSchemaType>({
    resolver: zodResolver(employeeSchema),
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

  const USER_OPTIONS = [
    { value: "USER", label: ClientEmployeeRoleMapper["USER"] },
    { value: "ADMIN", label: ClientEmployeeRoleMapper["ADMIN"] },
    { value: "VIEWER", label: ClientEmployeeRoleMapper["VIEWER"] },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Nome Completo"
          control={form.control}
          name="name"
          placeholder="João Silva"
          disabled={isPending || isEditing}
          Icon={User}
        />

        <FormInput
          label="E-mail Corporativo"
          control={form.control}
          name="email"
          type="email"
          placeholder="joao@cliente.com"
          disabled={isPending || isEditing}
          Icon={Mail}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Cargo"
            control={form.control}
            name="jobTitle"
            placeholder="Ex: Gerente Financeiro"
            disabled={isPending || isEditing}
            Icon={Briefcase}
          />

          <FormSelect
            label="Permissão"
            control={form.control}
            name="permissionRole"
            options={USER_OPTIONS}
            disabled={isPending}
            placeholder="Selecione um nível"
          />
          {/* Nível de Permissão */}
        </div>

        <div className="w-full flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto"
          >
            {isPending
              ? "Processando..."
              : isEditing
                ? "Atualizar Funcionário"
                : "Convidar Funcionário"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
