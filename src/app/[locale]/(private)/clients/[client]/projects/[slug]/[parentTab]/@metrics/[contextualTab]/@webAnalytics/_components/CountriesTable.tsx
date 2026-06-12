"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { calculateProportion } from "@/utils/calculateProportion";
import { Progress } from "@/components/ui/progress";
import { countriesMap } from "@/mappers/countryMapper";
import { useTranslations } from "next-intl";

type CountriesData = {
  name: string;
  value: number;
  pageviews: number;
};

interface ICountriesTable {
  countries: CountriesData[];
  totalVisitors: number;
  totalPageViews: number;
}

export function CountriesTable({
  countries,
  totalVisitors,
  totalPageViews,
}: ICountriesTable) {
  const t = useTranslations("projects.metrics.webAnalytics.tables.countries");

  const data = countries.map((country) => {
    return {
      country: countriesMap[country.name],
      countryCode: country.name,
      visitors: country.value,
      pageViews: country.pageviews,
      visitorsPercentage: calculateProportion(totalVisitors, country.value),
      pageViewsPercentage: calculateProportion(
        totalPageViews,
        country.pageviews,
      ),
    };
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("country")}</TableHead>
          <TableHead>{t("code")}</TableHead>
          <TableHead>{t("views")}</TableHead>
          <TableHead>{t("viewsPercent")}</TableHead>
          <TableHead>{t("visitors")}</TableHead>
          <TableHead>{t("visitorsPercent")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((country) => (
          <TableRow key={country.countryCode}>
            <TableCell>{country.country}</TableCell>
            <TableCell>
              <Badge variant="outline">{country.countryCode}</Badge>
            </TableCell>
            <TableCell className="max-w-[150px] text-right">
              {country.pageViews}
            </TableCell>
            <TableCell className="max-w-[250px] flex items-center gap-2">
              <Progress value={country.pageViewsPercentage} />
              {country.pageViewsPercentage}%
            </TableCell>
            <TableCell className="max-w-[150px] text-right">
              {country.visitors}
            </TableCell>
            <TableCell className="max-w-[250px] flex items-center gap-2">
              <Progress value={country.visitorsPercentage} />
              {country.visitorsPercentage}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
