"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckedState } from "@radix-ui/react-checkbox";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Key, ShieldCheck } from "lucide-react";

import { Form } from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import {
  IntegrationFieldInputType,
  IntegrationFieldKeyType,
  IntegrationTypeData,
  getDefaultInputTypeForKeyType,
  integrationFieldInputTypes,
  integrationTypeSchema,
  normalizeIntegrationFieldSchema,
} from "@/schemas/integration/integrationType";
import { createIntegrationTypeAction } from "@/actions/integrations/createIntegrationTypeAction";
import { updateIntegrationTypeAction } from "@/actions/integrations/updateIntegrationTypeAction";
import { FormSwitchCard } from "@/components/form/FormSwitchCard";
import { FormInputSlug } from "@/components/form/FormInputSlug";
import { FormTextarea } from "@/components/form/FormTextarea";
import { FormInput } from "@/components/form/FormInput";

interface IIntegrationFormProps {
  integration?: {
    id: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    enableByol?: boolean;
    fieldsSchema?: any;
    externalDocsUrl?: string | null;
  };
  handleCloseModal: () => void;
}

export function IntegrationTypeForm({
  integration,
  handleCloseModal,
}: IIntegrationFormProps) {
  const t = useTranslations("settings.integrations.catalog.form");

  const getKeyTypeLabel = (keyType: IntegrationFieldKeyType) => {
    switch (keyType) {
      case "TAG":
        return t("keyTypeOptions.tag");
      case "PUBLIC_KEY":
        return t("keyTypeOptions.publicKey");
      case "SECRET":
        return t("keyTypeOptions.secret");
    }
  };

  const getInputTypeLabel = (inputType: IntegrationFieldInputType) => {
    switch (inputType) {
      case "text":
        return t("inputTypeOptions.text");
      case "password":
        return t("inputTypeOptions.password");
      case "email":
        return t("inputTypeOptions.email");
      case "url":
        return t("inputTypeOptions.url");
    }
  };
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldKeyType, setNewFieldKeyType] =
    useState<IntegrationFieldKeyType>("SECRET");
  const [newFieldInputType, setNewFieldInputType] =
    useState<IntegrationFieldInputType>("password");

  const handleKeyTypeChange = (value: IntegrationFieldKeyType) => {
    setNewFieldKeyType(value);
    setNewFieldInputType(getDefaultInputTypeForKeyType(value));
  };

  const form = useForm({
    resolver: zodResolver(integrationTypeSchema),
    defaultValues: {
      name: integration?.name ?? "",
      description: integration?.description ?? "",
      logo: integration?.logo ?? "",
      enableByol: integration?.enableByol ?? false,
      externalDocsUrl: integration?.externalDocsUrl ?? "",
      fieldsSchema: (integration?.fieldsSchema ?? []).map(
        normalizeIntegrationFieldSchema,
      ),
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "fieldsSchema",
  });

  const isByolEnabled = form.watch("enableByol");

  const handleAddField = () => {
    if (!newFieldLabel || !newFieldKey) {
      toast.error(t("fieldRequired"));
      return;
    }

    const exists = fields.some((f) => f.key === newFieldKey);
    if (exists) {
      toast.error(t("duplicateKey"));
      return;
    }

    append({
      label: newFieldLabel,
      key: newFieldKey.toUpperCase().replace(/\s+/g, "_"),
      keyType: newFieldKeyType,
      type: newFieldInputType,
      required: true,
      dependsOnByol: false, // Default falso ao criar
    });

    setNewFieldLabel("");
    setNewFieldKey("");
    setNewFieldKeyType("SECRET");
    setNewFieldInputType("password");
  };

  const onSubmit = (data: IntegrationTypeData) => {
    startTransition(async () => {
      const action = integration
        ? () => updateIntegrationTypeAction({ ...data, id: integration.id })
        : () => createIntegrationTypeAction(data);

      const result = await action();

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        integration ? t("toastUpdateSuccess") : t("toastCreateSuccess"),
      );
      handleCloseModal();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="grid grid-cols-1 gap-4">
            <FormInputSlug
              control={form.control}
              name="name"
              label={t("name")}
              placeholder={t("namePlaceholder")}
              disabled={isPending}
            />

            <FormInput
              control={form.control}
              name="logo"
              label={t("logo")}
              placeholder="/nome-logo.png"
              disabled={isPending}
            />

            <FormSwitchCard
              control={form.control}
              name="enableByol"
              label={t("byol")}
              description={t("byolDescription")}
              icon={ShieldCheck}
              disabled={isPending}
            />

            <FormTextarea
              control={form.control}
              name="description"
              label={t("description")}
              placeholder={t("descriptionPlaceholder")}
              rows={2}
              disabled={isPending}
            />
            <FormInput
              control={form.control}
              name="externalDocsUrl"
              label={t("externalDocs")}
              type="url"
              placeholder="https://..."
              disabled={isPending}
            />
          </div>

          {/* --- SEÇÃO BUILDER DE CAMPOS --- */}
          <div className="space-y-4 lg:border-l lg:pl-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Key className="w-4 h-4" /> {t("fieldsBuilderTitle")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("fieldsBuilderDescription")}
              </p>
            </div>

            <div className="flex flex-col p-4 bg-muted/30 rounded-lg border border-dashed">
              <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
                <div className="flex-1 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    {t("keyType")}
                  </span>
                  <Select
                    value={newFieldKeyType}
                    onValueChange={(value) =>
                      handleKeyTypeChange(value as IntegrationFieldKeyType)
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TAG">
                        {t("keyTypeOptions.tag")}
                      </SelectItem>
                      <SelectItem value="PUBLIC_KEY">
                        {t("keyTypeOptions.publicKey")}
                      </SelectItem>
                      <SelectItem value="SECRET">
                        {t("keyTypeOptions.secret")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    {t("inputType")}
                  </span>
                  <Select
                    value={newFieldInputType}
                    onValueChange={(value) =>
                      setNewFieldInputType(value as IntegrationFieldInputType)
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {integrationFieldInputTypes.map((inputType) => (
                        <SelectItem key={inputType} value={inputType}>
                          {getInputTypeLabel(inputType)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
                <div className="flex-1 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    {t("uiNameLabel")}
                  </span>
                  <Input
                    placeholder={t("uiNamePlaceholder")}
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    {t("keyLabel")}
                  </span>
                  <Input
                    placeholder={t("keyPlaceholder")}
                    value={newFieldKey}
                    onChange={(e) => setNewFieldKey(e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleAddField}
                className="sm:self-end mt-4"
              >
                <Plus className="w-4 h-4" />
                {t("addField")}
              </Button>
            </div>

            {fields.length > 0 && (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-[11px]">
                        {t("tableLabel")}
                      </TableHead>
                      <TableHead className="text-[11px]">
                        {t("tableKey")}
                      </TableHead>
                      <TableHead className="text-[11px]">
                        {t("tableKeyType")}
                      </TableHead>
                      <TableHead className="text-[11px]">
                        {t("tableInputType")}
                      </TableHead>
                      {isByolEnabled && (
                        <TableHead className="text-[11px] text-center w-[80px]">
                          {t("tableByol")}
                        </TableHead>
                      )}
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((item, index) => (
                      <TableRow key={item.id} className="group">
                        <TableCell className="py-2 text-sm">
                          {item.label}
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] uppercase"
                          >
                            {item.key}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {getKeyTypeLabel(item.keyType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {getInputTypeLabel(item.type)}
                          </Badge>
                        </TableCell>

                        {isByolEnabled && (
                          <TableCell className="py-2 text-center">
                            <Checkbox
                              checked={item.dependsOnByol}
                              onCheckedChange={(checked: CheckedState) => {
                                update(index, {
                                  ...item,
                                  dependsOnByol: !!checked,
                                });
                              }}
                            />
                          </TableCell>
                        )}

                        <TableCell className="py-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* ... Botões de Ação Cancelar/Salvar ... */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            type="button"
            onClick={handleCloseModal}
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? tCommon("saving") : t("save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
