import { getCachedUmamiMetrics } from "../_data/get-umami-metrics";
import { PieCustomChart } from "../../../../../../../../../../../../components/Charts/PieCustomChart";
import { CustomHorizontalChart } from "./CustomHorizontalChart";
import { getTranslations } from "next-intl/server";

interface IDeviceAndSoChartsContainer {
  slug: string;
}

const deviceColorMapper = (device: string) => {
  const colors: Record<string, string> = {
    desktop: "#a855f7",
    laptop: "#a855f7",
    mobile: "#3b82f6",
    smartphone: "#3b82f6",
    tablet: "#eab308",
    tv: "#10b981",
    console: "#f43f5e",
    watch: "#06b6d4",
  };
  return colors[device.toLowerCase()] || "#64748b";
};

const browserColorMapper = (browser: string) => {
  const colors: Record<string, string> = {
    chrome: "#ea4335",
    "edge-chromium": "#0078d7",
    edge: "#0078d7",
    firefox: "#ff9400",
    safari: "#0070c9",
    opera: "#ff1b2d",
    samsung: "#1428a0",
    ucbrowser: "#00a5e2",
    brave: "#fb542b",
    vivaldi: "#ef3939",
    bot: "#475569",
  };

  return colors[browser.toLowerCase()] || "#64748b";
};

export async function DeviceAndSoChartsContainer({
  slug,
}: IDeviceAndSoChartsContainer) {
  const t = await getTranslations("projects.metrics.webAnalytics.charts");
  const metrics = await getCachedUmamiMetrics(slug);

  const { devices, browsers, os } = metrics.breakdown;

  const devicesData = devices.map((device) => ({
    name:
      device.name.charAt(0).toUpperCase() + device.name.slice(1).toLowerCase(),
    value: device.value,
    iconKey: device.name,
    color: deviceColorMapper(device.name),
  }));

  const browsersData = browsers.map((browser) => ({
    name:
      browser.name.charAt(0).toUpperCase() +
      browser.name.slice(1).toLowerCase(),
    value: browser.value,
    iconKey: browser.name,
    color: browserColorMapper(browser.name),
  }));

  const osData = os.map((item) => ({
    name: item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase(),
    value: item.value,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <PieCustomChart
        title={t("devices.title")}
        description={t("devices.description")}
        data={devicesData}
      />
      <PieCustomChart
        title={t("browsers.title")}
        description={t("browsers.description")}
        data={browsersData}
      />
      <CustomHorizontalChart
        title={t("os.title")}
        description={t("os.description")}
        data={osData}
      />
    </div>
  );
}
