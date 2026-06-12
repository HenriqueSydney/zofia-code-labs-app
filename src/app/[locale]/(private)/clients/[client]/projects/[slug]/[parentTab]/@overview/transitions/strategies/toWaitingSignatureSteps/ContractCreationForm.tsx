"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, FileText } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { createContractAction } from "@/actions/contract/createContract";
import { TransitionStrategyProps } from "../../types";

const formSchema = z.object({});

type FormValues = z.infer<typeof formSchema>;

export function ContractCreationForm({
  project,
  onCancel,
}: Omit<TransitionStrategyProps, "onSuccess">) {
  const t = useTranslations("projects.transitions.contractCreation");
  const tCommon = useTranslations("projects.transitions.common");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const handleSubmit = async () => {
    if (!file) {
      toast.error(tCommon("validation.selectPdfFile"));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("projectId", project.id);
      formData.append("document", file);

      const result = await createContractAction(formData);

      if (result?.error) {
        toast.error(t("toast.generateError"));
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
        toast.error(t("toast.unexpectedError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium leading-none">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        <Separator className="my-4" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4 border p-4 rounded-md bg-card">
            <div className="space-y-2 border-2 border-dashed border-muted-foreground/25 p-6 rounded-md bg-muted/5 hover:bg-muted/10 transition-colors flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-muted rounded-full mb-2">
                {file ? (
                  <FileText className="h-6 w-6 text-primary" />
                ) : (
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                )}
              </div>

              <Label
                htmlFor="contract-upload"
                className="cursor-pointer text-sm font-medium"
              >
                {file ? (
                  <span className="text-green-600 font-semibold">
                    {file.name}
                  </span>
                ) : (
                  <>
                    <span className="text-primary hover:underline">
                      {tCommon("upload.clickToSelect")}
                    </span>{" "}
                    {tCommon("upload.orDragPdf")}
                  </>
                )}
              </Label>

              <Input
                id="contract-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              {!file && (
                <p className="text-xs text-muted-foreground">
                  {tCommon("upload.linkedToProjectHint")}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="px-6">
              {loading ? tCommon("processing") : t("submit")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
