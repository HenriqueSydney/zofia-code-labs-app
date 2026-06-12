"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Upload,
  Building,
  Globe,
  Search,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormMaskInput } from "@/components/form/FormMaskInput";
import { fetchAddressByCep } from "@/services/cep/cepService";
import { FormInput } from "@/components/form/FormInput";

type AddressMode = "initial" | "found" | "manual";

interface OrganizationSettingsFormProps {
  initialData: any;
  canEdit?: boolean;
}

export function OrganizationSettingsForm({
  initialData,
  canEdit = true,
}: OrganizationSettingsFormProps) {
  const t = useTranslations("organization.settings");
  const tCommon = useTranslations("common");
  const [isPending, setIsPending] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const settingsSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t("validation.nameMin")),
        slug: z
          .string()
          .min(3)
          .regex(/^[a-z0-9-]+$/, t("validation.slugFormat")),
        logoUrl: z.string().optional(),
        cnpj: z.string().optional(),
        zipCode: z.string().min(9, t("validation.zipCodeInvalid")),
        street: z.string().min(1, t("validation.streetRequired")),
        number: z.string().min(1, t("validation.numberRequired")),
        complement: z.string().optional(),
        neighborhood: z.string().min(1, t("validation.neighborhoodRequired")),
        city: z.string().min(1, t("validation.cityRequired")),
        state: z.string().length(2, t("validation.stateInvalid")),
      }),
    [t],
  );

  type SettingsFormData = z.infer<typeof settingsSchema>;

  const savedAddress = initialData.settings?.address || {};
  const hasSavedAddress = !!savedAddress.zipCode;

  const [addressMode, setAddressMode] = useState<AddressMode>(
    hasSavedAddress ? "found" : "initial",
  );

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialData.name,
      slug: initialData.slug,
      logoUrl: initialData.settings?.logoUrl || "",
      cnpj: initialData.cnpj || "",
      zipCode: savedAddress.zipCode || "",
      street: savedAddress.street || "",
      number: savedAddress.number || "",
      complement: savedAddress.complement || "",
      neighborhood: savedAddress.neighborhood || "",
      city: savedAddress.city || "",
      state: savedAddress.state || "",
    },
  });

  async function handleCepSearch() {
    const cep = form.getValues("zipCode");

    if (!cep || cep.replace(/\D/g, "").length !== 8) {
      toast.error(t("toast.zipCodeInvalid"));
      return;
    }

    setIsLoadingCep(true);
    try {
      const address = await fetchAddressByCep(cep);

      form.setValue("street", address.street);
      form.setValue("neighborhood", address.neighborhood);
      form.setValue("city", address.city);
      form.setValue("state", address.state);

      setAddressMode("found");

      form.setFocus("number");
    } catch (error) {
      setAddressMode("manual");

      toast.error(t("toast.zipCodeNotFound"));
      form.setFocus("street");
    } finally {
      setIsLoadingCep(false);
    }
  }

  async function onSubmit(data: SettingsFormData) {
    setIsPending(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      toast.success(t("toast.updateSuccess"));
    } catch (error) {
      toast.error(t("toast.updateError"));
    } finally {
      setIsPending(false);
    }
  }

  const handleLogoUpload = () => {
    toast.info(t("toast.uploadInfo"));
  };

  const isFixedFieldReadOnly =
    addressMode === "initial" || addressMode === "found";

  const isStreetReadOnly = addressMode === "initial";

  const zipCodeValue = form.watch("zipCode");

  useEffect(() => {
    const cleanCep = zipCodeValue?.replace(/\D/g, "");
    if (cleanCep?.length === 8) {
      handleCepSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipCodeValue]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={!canEdit} className="space-y-6 border-0 p-0 m-0 min-w-0">
        <Card>
          <CardHeader>
            <CardTitle>{t("general.title")}</CardTitle>
            <CardDescription>{t("general.description")}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2">
                  <AvatarImage src={form.watch("logoUrl")} />
                  <AvatarFallback className="text-xl font-bold bg-muted">
                    {initialData.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t("general.logoTitle")}</h4>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    {t("general.logoHelper")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLogoUpload}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t("general.changeLogo")}
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormInput
                  label={t("general.orgName")}
                  control={form.control}
                  name="name"
                  Icon={Building}
                  description={t("general.orgNameDescription")}
                />

                <FormInput
                  label={t("general.slug")}
                  control={form.control}
                  name="slug"
                  Icon={Globe}
                  description={`${form.watch("slug")}.zofiacodelabs.com.br`}
                />
              </div>

              {form.watch("slug") !== initialData.slug && (
                <Alert
                  variant="destructive"
                  className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                >
                  <AlertTriangle className="h-4 w-4 stroke-yellow-600" />
                  <AlertTitle>{t("general.slugWarningTitle")}</AlertTitle>
                  <AlertDescription>
                    {t("general.slugWarningDescription")}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-none mb-2">
                  {t("address.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("address.description")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormMaskInput
                  label={t("address.cnpj")}
                  control={form.control}
                  name="cnpj"
                  mask="##.###.###/####-##"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="grid md:grid-cols-4 gap-4 items-start">
                <div className="flex gap-2 items-end">
                  <FormMaskInput
                    label={t("address.zipCode")}
                    control={form.control}
                    name="zipCode"
                    mask="#####-###"
                    placeholder="00000-000"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCepSearch}
                    disabled={isLoadingCep}
                    className="mb-[2px]"
                  >
                    {isLoadingCep ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center">
                {addressMode === "initial" && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {t("address.searchHint")}
                  </p>
                )}
                {addressMode === "manual" && (
                  <p className="text-xs text-yellow-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {t("address.manualHint")}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <FormInput
                    label={t("address.city")}
                    control={form.control}
                    name="city"
                    readOnly={isFixedFieldReadOnly}
                    className={isFixedFieldReadOnly ? "opacity-70" : ""}
                    tabIndex={isFixedFieldReadOnly ? -1 : 0}
                  />
                </div>

                <FormInput
                  label={t("address.state")}
                  control={form.control}
                  name="state"
                  maxLength={2}
                  placeholder="UF"
                  readOnly={isFixedFieldReadOnly}
                  className={isFixedFieldReadOnly ? "opacity-70" : ""}
                  tabIndex={isFixedFieldReadOnly ? -1 : 0}
                />

                <FormInput
                  label={t("address.neighborhood")}
                  control={form.control}
                  name="neighborhood"
                  readOnly={isFixedFieldReadOnly}
                  className={isFixedFieldReadOnly ? "opacity-70" : ""}
                  tabIndex={isFixedFieldReadOnly ? -1 : 0}
                />
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <FormInput
                    label={t("address.street")}
                    control={form.control}
                    name="street"
                    readOnly={isStreetReadOnly}
                    className={isStreetReadOnly ? "opacity-70" : ""}
                  />
                </div>

                <FormInput
                  label={t("address.number")}
                  control={form.control}
                  name="number"
                />
                <FormInput
                  label={t("address.complement")}
                  control={form.control}
                  name="complement"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t bg-muted/5 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground hidden sm:block">
              {t("footer.saveReminder")}
            </p>
            {canEdit && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => form.reset()}
                >
                  {t("footer.discard")}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {tCommon("actions.saveChanges")}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
        </fieldset>
      </form>
    </Form>
  );
}
