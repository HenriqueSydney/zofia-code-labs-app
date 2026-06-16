"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";

import { createProposalAction } from "@/actions/proposal/createProposal";
import { date, date as day } from "@/lib/dayjs";
import { calculateItemFinalPrice } from "@/utils/calculateItemFinalPrice";
import { formatCurrency } from "@/utils/formatCurrency";
import { TransitionStrategyProps } from "../../types";
import { FormNumberInput } from "@/components/form/FormNumberInput";
import { FormDatePicker } from "@/components/form/FormDatePicker";

import { getPaymentGatewaysAvailableIntegrations } from "@/actions/integrations/paymentGateway/getPaymentGatewaysAvailableIntegrations";
import { OrganizationIntegrationWithSafeInformation } from "@/repositories/IOrganizationIntegrationRepository";
import {
  paymentGatewayMapper,
  paymentMethods,
} from "@/mappers/paymentGatewayMapper";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { FormRadioCards } from "@/components/form/FormRadioCards";
import { FormSelect } from "@/components/form/FormSelect";

const createFormSchema = (requiredMessage: string) =>
  z.object({
    validUntil: z.date(),
    downPaymentPercentage: z.number({ error: requiredMessage }).min(0).max(100),
    items: z
      .array(
        z.object({
          serviceTypeId: z.string(),
          serviceName: z.string(),
          discountType: z.enum(["PERCENTAGE", "FIXED"]),
          discount: z.number().min(0),
          basePrice: z.number().optional(),
        }),
      )
      .optional(),
    paymentGatewayId: z.string().optional(),
    paymentMethod: z.enum(paymentMethods).nullable().optional(),
  });

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

export function ProposalCreationForm({
  project,
  onSuccess,
  onCancel,
}: TransitionStrategyProps) {
  const t = useTranslations("projects.transitions.proposalCreation");
  const tCommon = useTranslations("projects.transitions.common");
  const tBack = useTranslations("common");
  const [availablePaymentGateways, setAvailablePaymentGateways] = useState<
    OrganizationIntegrationWithSafeInformation[]
  >([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const formSchema = createFormSchema(tCommon("validation.required"));

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      validUntil: day().add(7, "days").toDate(),
      downPaymentPercentage: 30,
      paymentGatewayId: "cash",
      paymentMethod: "pix",
      items: project.projectServices.map((s) => ({
        serviceTypeId: s.serviceTypeId,
        serviceName: s.serviceType.name,
        discountType: "PERCENTAGE" as const,
        discount: 0,
        basePrice:
          s.serviceType.basePrice != null
            ? Number(s.serviceType.basePrice)
            : undefined,
      })),
    },
  });

  const watchedItems = form.watch("items");
  const watchedPaymentGatewayId = form.watch("paymentGatewayId");
  const watchedDownPayment = form.watch("downPaymentPercentage");

  const calculatedTotal =
    watchedItems?.reduce((acc, item) => {
      const originalService = project.projectServices.find(
        (s) => s.serviceTypeId === item.serviceTypeId,
      );
      const basePrice = originalService?.serviceType?.basePrice || 0;
      return (
        acc + calculateItemFinalPrice({ ...item, price: Number(basePrice) })
      );
    }, 0) || 0;

  const downPaymentValue = calculatedTotal * (watchedDownPayment / 100);

  const handleSubmit = async (values: FormValues) => {
    if (!file) {
      toast.error(tCommon("validation.selectPdfFile"));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("projectId", project.id);

      const itemsPayload =
        values.items?.map((item) => ({
          serviceTypeId: item.serviceTypeId,
          discountType: item.discountType,
          discount: item.discount,
        })) ?? [];

      formData.append("items", JSON.stringify(itemsPayload));
      formData.append("validUntil", values.validUntil.toISOString());
      formData.append(
        "downPaymentPercentage",
        String(values.downPaymentPercentage),
      );
      formData.append("paymentGatewayId", values.paymentGatewayId ?? "cash");
      formData.append("paymentMethod", values.paymentMethod ?? "pix");
      formData.append("document", file);

      const result = await createProposalAction(formData);

      if (result?.error) {
        toast.error(t("toast.generateError"));
        return;
      }
      if (onSuccess) onSuccess();
      else toast.success(t("toast.success"));
    } catch (error: unknown) {
      if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
        toast.error(t("toast.unexpectedError"));
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchAvailablePaymentGateways() {
      const paymentGateways = await getPaymentGatewaysAvailableIntegrations();
      setAvailablePaymentGateways(paymentGateways);
    }
    fetchAvailablePaymentGateways();
  }, []);

  const gatewayOptions = availablePaymentGateways.map((paymentGateway) => {
    let description =
      paymentGatewayMapper[
        paymentGateway.integrationType.slug as keyof typeof paymentGatewayMapper
      ].join("; ");
    if (paymentGateway.healthStatus !== "HEALTHY") {
      description = "Gateway de pagamento indisponível";
    }
    if (!paymentGateway.enabled) {
      description = "Gateway de pagamento desativado";
    }
    return {
      value: paymentGateway.integrationType.slug,
      label: paymentGateway.integrationType.name,
      description: capitalizeFirstLetter(description ?? ""),
      disabled:
        !paymentGateway.enabled || paymentGateway.healthStatus !== "HEALTHY",
    };
  });

  const finalPaymentMethods = [
    {
      value: "cash",
      label: "Dinheiro ou Pix",
      description: "Sem utilização de gateway de pagamento",
      disabled: false,
    },
    ...gatewayOptions,
  ];

  const gatewayPaymentMethods = watchedPaymentGatewayId
    ? paymentGatewayMapper[
        watchedPaymentGatewayId as keyof typeof paymentGatewayMapper
      ]
    : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4 border p-4 rounded-md bg-card">
          <div className="space-y-2 border border-dashed p-6 rounded-md bg-muted/20 flex flex-col items-center justify-center text-center">
            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
            <Label
              htmlFor="file-upload"
              className="cursor-pointer text-primary hover:underline"
            >
              {t("upload.clickToSelectPdf")}
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <p className="text-sm font-medium text-green-600 mt-2">
                {t("upload.fileSelected")} {file.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t mt-4">
            <FormNumberInput
              control={form.control}
              name="downPaymentPercentage"
              label={t("fields.downPayment.label")}
              min={0}
              max={100}
              placeholder="30"
            />

            <FormDatePicker
              control={form.control}
              name="validUntil"
              label={t("fields.validUntil.label")}
              minDate={date().toDate()}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {t("fields.items.title")}
            </Label>
            <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 mt-2">
              {form.watch("items")?.map((item, index) => (
                <div
                  key={item.serviceTypeId}
                  className="grid grid-cols-12 gap-3 items-center border-b pb-3 last:border-0"
                >
                  <div className="col-span-5 flex flex-col justify-center">
                    <p
                      className="text-sm font-medium truncate"
                      title={item.serviceName}
                    >
                      {item.serviceName}
                    </p>
                    {item.basePrice && (
                      <span className="text-xs text-muted-foreground">
                        {t("fields.items.basePriceLabel")}{" "}
                        {formatCurrency(item.basePrice)}
                      </span>
                    )}
                  </div>

                  <div className="col-span-4">
                    <FormSelect
                      control={form.control}
                      name={`items.${index}.discountType`}
                      label={t("fields.items.discountType.label")}
                      options={[
                        { value: "PERCENTAGE", label: "%" },
                        { value: "FIXED", label: "R$" },
                      ]}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormNumberInput
                      control={form.control}
                      name={`items.${index}.discount`}
                      label={t("fields.items.discountValue.label")}
                      placeholder="0"
                      min={0}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <FormRadioCards
          control={form.control}
          name="paymentGatewayId"
          options={finalPaymentMethods}
          gridColumns={finalPaymentMethods.length}
        />

        {watchedPaymentGatewayId !== "cash" && (
          <FormRadioCards
            control={form.control}
            name="paymentMethod"
            options={gatewayPaymentMethods.map((method) => ({
              value: method,
              label: capitalizeFirstLetter(method ?? ""),
              disabled: false,
            }))}
            gridColumns={finalPaymentMethods.length}
          />
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t mt-6">
          <div className="flex flex-col items-start">
            <span className="text-sm text-muted-foreground font-medium">
              {t("summary.totalLabel")}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(calculatedTotal)}
              </span>
              <span className="text-sm text-muted-foreground italic">
                {t("summary.downPayment", {
                  amount: formatCurrency(downPaymentValue),
                })}
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 sm:flex-none"
              disabled={loading}
            >
              {tBack("back")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? tCommon("processing") : t("submit")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
