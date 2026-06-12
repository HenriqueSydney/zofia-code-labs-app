"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { fetchGitHubRepositoriesAction } from "@/actions/integrations/github/fetchGitHubRepositoriesAction";
import { MinimalRepositoryListDTO } from "@/dto/github/RepositoriesDTO";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GitHubSetupSchema } from "@/schemas/integration/GitHubSetupSchema";
import { useTranslations } from "next-intl";

interface IGitHubIntegrationForm {
  isModalOpen: boolean;
  setIsModalOpen: () => void;
  handleConnectServiceToProject: (data: any) => void;
  projectSlug: string;
}

export function GitHubIntegrationForm({
  isModalOpen,
  setIsModalOpen,
  handleConnectServiceToProject,
  projectSlug = "",
}: IGitHubIntegrationForm) {
  const t = useTranslations("projects.metrics.integrations.github");
  const [repositories, setRepositories] = useState<MinimalRepositoryListDTO>(
    [],
  );
  const form = useForm({
    resolver: zodResolver(GitHubSetupSchema),
    defaultValues: {
      isNewRepo: true,
      shouldClone: false,
      repoName: projectSlug,
    },
  });

  const isNewRepo = form.watch("isNewRepo");
  const shouldClone = form.watch("shouldClone");

  const handleFetchGitHubRepositories = async () => {
    const result = await fetchGitHubRepositoriesAction();
    if (!result.success || !result.data) {
      toast.error(t("fetchReposError"));
      return;
    }

    setRepositories(result.data);
  };

  useEffect(() => {
    handleFetchGitHubRepositories();
  }, []);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        <Alert variant="default" className="bg-accent/5 border-accent/50">
          <InfoIcon className="h-4 w-4 text-accent!" />
          <AlertTitle className="text-accent">{t("alertTitle")}</AlertTitle>
          <AlertDescription>{t("alertDescription")}</AlertDescription>
        </Alert>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleConnectServiceToProject)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="isNewRepo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-3">
                  <FormLabel>{t("createNewRepo")}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isNewRepo && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                <FormField
                  control={form.control}
                  name="repoName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("newRepoName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shouldClone"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>{t("useTemplate")}</FormLabel>
                        <FormDescription>
                          {t("useTemplateDescription")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {shouldClone && (
                  <FormField
                    control={form.control}
                    name="templateRepoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("templateRepo")}</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("templatePlaceholder")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {repositories.map((repo) => (
                              <SelectItem key={repo.id} value={repo.name}>
                                {repo.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {!isNewRepo && (
              <FormField
                control={form.control}
                name="repositoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("linkExisting")}</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("existingPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {repositories.map((repo) => (
                          <SelectItem key={repo.id} value={repo.id.toString()}>
                            {repo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("confirm")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
