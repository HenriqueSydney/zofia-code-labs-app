"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CopyPlus, Loader2 } from "lucide-react";

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
import { syncServiceBacklogToProjectAction } from "@/actions/backlog/syncServiceBacklogToProjectAction";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

// Interface básica para os itens do Select
interface ServiceTypeOption {
  id: string;
  name: string;
}

interface IncludeServiceDefaultBacklogProps {
  buttonLabel?: boolean;
  projectId: string;
  availableServices: ServiceTypeOption[];
}

// Schema de validação
const createLinkServiceSchema = (validationMessage: string) =>
  z.object({
    serviceTypeId: z.string().min(1, validationMessage),
  });

type LinkServiceSchema = z.infer<ReturnType<typeof createLinkServiceSchema>>;

export function IncludeServiceDefaultBacklog({
  buttonLabel,
  projectId,
  availableServices,
}: IncludeServiceDefaultBacklogProps) {
  const t = useTranslations("projects.backlog.import");
  const tActions = useTranslations("common.actions");
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const linkServiceSchema = createLinkServiceSchema(t("validationSelectService"));

  const form = useForm<LinkServiceSchema>({
    resolver: zodResolver(linkServiceSchema),
    defaultValues: {
      serviceTypeId: "",
    },
  });

  const { client: clientSlug, slug: projectSlug } = params;

  const onSubmit = (data: LinkServiceSchema) => {
    startTransition(async () => {
      try {
        const result = await syncServiceBacklogToProjectAction(
          data,
          projectId,
          projectSlug as string,
          clientSlug as string,
        );

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        setIsOpen(false);
        form.reset();

        // router.refresh(); // Lembrar de dar refresh após criar a action
      } catch (error) {
        console.error(error);
        toast.error(t("toastSyncError"));
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={buttonLabel ? "outline" : "ghost"}
          className="gap-2"
          title={t("title")}
        >
          <CopyPlus className="w-4 h-4" />
          {buttonLabel && t("title")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg space-y-2">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="serviceTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("serviceTypeLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectService")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                {tActions("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("importing")}
                  </>
                ) : (
                  t("confirm")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
