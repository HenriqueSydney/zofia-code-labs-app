import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/SectionHeading";
import { operationWrapper } from "@/lib/operationWrapper";
import { AppError } from "@/errors/AppError";
import { listExpenseCategoryAction } from "@/actions/expenses/listExpenseCategoryAction";
import { getParams } from "@/utils/getParams";
import { CreateExpenseCategoryForm } from "./components/CreateExpenseCategoryForm";
import { ExpenseCategoryRemoveOrEdit } from "./components/ExpenseCategoryRemoveOrEdit";
import { QueryFilter } from "@/components/QueryFilter";
import { expenseNatureMapper } from "@/mappers/expenseNatureMapper";
import { cn } from "@/lib/utils";
import { ExpenseNature } from "@/generated/prisma/enums";
import { Tags, TrendingDown } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface IExpenseCategory {
  searchParams: Promise<{ query: string }>;
}

export default async function ExpenseCategory({
  searchParams,
}: IExpenseCategory) {
  const { query } = await getParams(searchParams, ["query"]);

  const [error, success] = await operationWrapper(
    "action",
    "fetchServiceCategoryAction",
    () => {
      return listExpenseCategoryAction(query);
    },
    {
      cache: "no-cache",
    }
  );

  if (error) {
    throw new AppError("Falha na recuperação das categorias de despesas");
  }

  const expensesCategories = success.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          title="Tipos de Despesa"
          description="Categorize as movimentações financeiras"
        />
        <CreateExpenseCategoryForm />
      </div>

      <QueryFilter placeholder="Buscar categoria de despensa..." />

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
                        {natureConfig.label}
                      </Badge>
                    </div>
                  </div>

                  <ExpenseCategoryRemoveOrEdit expenseCategory={category} />
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
          title="Nenhuma categoria de despesa localizada"
          description="Cadastre categorias de despesa e para categorizar suas movimentações financeiras"
        />
      )}
    </div>
  );
}
