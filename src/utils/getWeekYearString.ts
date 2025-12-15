import { date } from "@/lib/dayjs";

export function getWeekYearString(d = date()) {
  const week = d.isoWeek();
  const year = d.year();
  return `${String(week).padStart(2, "0")}/${year}`;
}
