import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/SectionHeading";
import { operationWrapper } from "@/lib/operationWrapper";
import { ValidationError } from "@/errors";
import { listExpenseCategoryAction } from "@/actions/expenses/listExpenseCategoryAction";
import { getParams } from "@/utils/getParams";
import { CreateExpenseCategoryForm } from "./components/CreateExpenseCategoryForm";
import { ExpenseCategoryRemoveOrEdit } from "./components/ExpenseCategoryRemoveOrEdit";
import { QueryFilter } from "@/components/QueryFilter";
import { expenseNatureMapper, getExpenseNatureLabel } from "@/mappers/expenseNatureMapper";
import { cn } from "@/utils/twMerge";
import { ExpenseNature } from "@/generated/prisma/enums";
import { Tags, TrendingDown } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { auth } from "@/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { hasPermission } from "@/utils/hasPermission";
import { getTranslations } from "next-intl/server";

interface IExpenseCategory {
  searchParams: Promise<{ query: string }>;
}

export default async function ExpenseCategory({
  searchParams,
}: IExpenseCategory) {
  const t = await getTranslations("settings.expenses");
  const { query } = await getParams(searchParams, ["query"]);
  const session = await auth();

  const [error, success] = await operationWrapper(
    "action",
    "fetchServiceCategoryAction",
    () => {
      return listExpenseCategoryAction(query);
    },
    {
      cache: "no-cache",
    },
  );

  if (error) {
    throw new ValidationError(t("fetchError"));
  }

  const expensesCategories = success.data;
  const canEdit = hasPermission(
    session?.user,
    PERMISSIONS.SETTINGS.MANAGE_EXPENSE_CATEGORIES,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          title={t("title")}
          description={t("description")}
        />
        {canEdit && <CreateExpenseCategoryForm />}
      </div>

      <QueryFilter placeholder={t("searchPlaceholder")} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {expensesCategories.map((category) => {
          const natureConfig =
            expenseNatureMapper[category.nature as ExpenseNature];
          const Icon = natureConfig.icon;

          return (
            <Card
              key={category.id}
              className="flex flex-col hover:shadow-lg hover:scale-101 transition-all h-60"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={cn(natureConfig.badge, "mt-1 gap-2")}
                      >
                        <Icon className={cn(natureConfig.color, "h-4 w-4")} />
                        {getExpenseNatureLabel(
                          category.nature as ExpenseNature,
                          (key) => t(`nature.${key}`),
                        )}
                      </Badge>
                    </div>
                  </div>

                  {canEdit && (
                    <ExpenseCategoryRemoveOrEdit expenseCategory={category} />
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between space-y-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {expensesCategories.length === 0 && (
        <EmptyState
          icon={Tags}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      )}
    </div>
  );
}
