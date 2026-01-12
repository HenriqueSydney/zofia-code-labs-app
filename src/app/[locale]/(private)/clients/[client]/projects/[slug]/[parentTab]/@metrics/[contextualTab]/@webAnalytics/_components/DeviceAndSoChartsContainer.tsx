import { getCachedUmamiMetrics } from "../_data/get-umami-metrics";
import { PieCustomChart } from "../../../../../../../../../../../../components/Charts/PieCustomChart";
import { CustomHorizontalChart } from "./CustomHorizontalChart";

interface IDeviceAndSoChartsContainer {
  slug: string;
}

const deviceColorMapper = (device: string) => {
  const colors: Record<string, string> = {
    desktop: "#a855f7", // Roxo
    laptop: "#a855f7", // Roxo
    mobile: "#3b82f6", // Azul
    smartphone: "#3b82f6", // Azul
    tablet: "#eab308", // Amarelo
    tv: "#10b981", // Verde
    console: "#f43f5e", // Rosa/Vermelho
    watch: "#06b6d4", // Ciano
  };
  return colors[device.toLowerCase()] || "#64748b";
};

const browserColorMapper = (browser: string) => {
  const colors: Record<string, string> = {
    // Principais Navegadores
    chrome: "#ea4335", // Vermelho Google
    "edge-chromium": "#0078d7", // Azul Microsoft
    edge: "#0078d7",
    firefox: "#ff9400", // Laranja Firefox
    safari: "#0070c9", // Azul Apple
    opera: "#ff1b2d", // Vermelho Opera

    // Outros/Mobile
    samsung: "#1428a0", // Azul Samsung
    ucbrowser: "#00a5e2", // Azul UC
    brave: "#fb542b", // Laranja Brave
    vivaldi: "#ef3939", // Vermelho Vivaldi

    // Bots/Crawlers (se aparecerem)
    bot: "#475569", // Cinza Escuro
  };

  return colors[browser.toLowerCase()] || "#64748b"; // Cinza ardósia padrão
};

export async function DeviceAndSoChartsContainer({
  slug,
}: IDeviceAndSoChartsContainer) {
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
        title="Dispositivos"
        description="Por tipo de device"
        data={devicesData}
      />
      <PieCustomChart
        title="Navegadores"
        description="Por browser utilizado"
        data={browsersData}
      />
      <CustomHorizontalChart
        title="Sistemas Operacionais"
        description="Por OS dos visitantes"
        data={osData}
      />
    </div>
  );
}
