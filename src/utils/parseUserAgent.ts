import { Laptop, Smartphone } from "lucide-react";

// Helper simples para deixar o User Agent amigável (sem precisar de libs pesadas)
export const parseUserAgent = (ua: string | null) => {
  if (!ua) return { name: "Desconhecido", icon: Laptop };

  const lowerUA = ua.toLowerCase();
  let os = "Dispositivo";
  let browser = "Navegador";
  let Icon = Laptop;

  // Detectar OS
  if (lowerUA.includes("win")) os = "Windows";
  else if (lowerUA.includes("mac")) os = "MacOS";
  else if (lowerUA.includes("linux")) os = "Linux";
  else if (lowerUA.includes("android")) {
    os = "Android";
    Icon = Smartphone;
  } else if (lowerUA.includes("iphone") || lowerUA.includes("ipad")) {
    os = "iOS";
    Icon = Smartphone;
  }

  // Detectar Browser
  if (lowerUA.includes("firefox")) browser = "Firefox";
  else if (lowerUA.includes("chrome")) browser = "Chrome";
  else if (lowerUA.includes("safari") && !lowerUA.includes("chrome"))
    browser = "Safari";
  else if (lowerUA.includes("edge")) browser = "Edge";

  return { name: `${os} • ${browser}`, icon: Icon };
};
