"use client";

import { ReactNode, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { MetricsResponse } from "@/useCases/integration/umami/GetUmamiMetricsUseCase";
import { useTranslations } from "next-intl";
import { PagesTable } from "../../@webAnalytics/_components/PagesTable";
import { ReferrerTable } from "../../@webAnalytics/_components/ReferrerTable";
import { CountriesTable } from "../../@webAnalytics/_components/CountriesTable";

interface ListsDetailsProps {
  metrics: MetricsResponse["metrics"];
}

type AvailableTables = "pages" | "refered" | "countries";

type AvailableTablesMetadata = {
  label: string;
  title: string;
  description: string;
  content: ReactNode;
};

export function ListsDetails({ metrics }: ListsDetailsProps) {
  const t = useTranslations("projects.metrics.analytics.tables");
  const [selectedTable, setSelectedTable] = useState<AvailableTables>("pages");

  const selectedTableMapper: Record<AvailableTables, AvailableTablesMetadata> =
    useMemo(
      () => ({
        pages: {
          label: t("pages"),
          title: t("topPagesTitle"),
          description: t("topPagesDescription"),
          content: (
            <PagesTable
              totalPageViews={metrics.pageviews}
              pages={metrics.breakdown.pages}
            />
          ),
        },
        refered: {
          label: t("referrers"),
          title: t("trafficSourcesTitle"),
          description: t("trafficSourcesDescription"),
          content: (
            <ReferrerTable
              totalPageViews={metrics.pageviews}
              referrers={metrics.breakdown.referrers}
            />
          ),
        },
        countries: {
          label: t("countries"),
          title: t("countriesTitle"),
          description: t("countriesDescription"),
          content: (
            <CountriesTable
              countries={metrics.breakdown.countries}
              totalPageViews={metrics.pageviews}
              totalVisitors={metrics.visitors}
            />
          ),
        },
      }),
      [metrics, t],
    );

  return (
    <Card className="w-full">
      <Tabs
        value={selectedTable}
        onValueChange={(value) => setSelectedTable(value as AvailableTables)}
        className="w-full"
      >
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle>{selectedTableMapper[selectedTable].title}</CardTitle>
            <CardDescription>
              {selectedTableMapper[selectedTable].description}
            </CardDescription>
          </div>

          <TabsList className="grid grid-cols-3 w-full max-w-[400px] h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            {Object.entries(selectedTableMapper).map(([key, metadata]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {metadata.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardHeader>

        <CardContent>
          {Object.entries(selectedTableMapper).map(([key, metadata]) => {
            return (
              <TabsContent
                key={`content-${key}`}
                value={key}
                className="mt-0 focus-visible:outline-none"
              >
                {metadata.content}
              </TabsContent>
            );
          })}
        </CardContent>
      </Tabs>
    </Card>
  );
}
