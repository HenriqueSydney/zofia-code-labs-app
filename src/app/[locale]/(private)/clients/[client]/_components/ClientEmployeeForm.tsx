"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, User, Briefcase, ShieldCheck } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { z } from "zod";

// Importe suas novas actions aqui
import { createClientEmployeeAction } from "@/actions/clients/createClientEmployeeAction";
import { updateClientEmployeeAction } from "@/actions/clients/updateClientEmployeeAction";
import {
  employeeSchema,
  EmployeeSchemaType,
} from "@/schemas/clients/employeeSchema";
import { ClientEmployeeRoleMapper } from "@/mappers/clientEmployeeMappers";
import { ClientEmployeeRole } from "@/generated/prisma/enums";

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="João Silva"
                    className="pl-9"
                    disabled={isPending || isEditing} // Geralmente não editamos nome se atrelado ao User
                    {...field}
                  />
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* E-mail */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail Corporativo</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="joao@cliente.com"
                    className="pl-9"
                    disabled={isPending || isEditing} 
                    {...field}
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cargo */}
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Ex: Gerente Financeiro"
                      className="pl-9"
                      disabled={isPending}
                      {...field}
                    />
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nível de Permissão */}
          <FormField
            control={form.control}
            name="permissionRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permissão</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger className="pl-9 relative">
                      <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Selecione um nível" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USER">
                      {ClientEmployeeRoleMapper["USER"]}
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      {ClientEmployeeRoleMapper["ADMIN"]}
                    </SelectItem>
                    <SelectItem value="VIEWER">
                      {ClientEmployeeRoleMapper["VIEWER"]}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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
