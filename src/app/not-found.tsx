import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Geist } from "next/font/google";
import Header from "../components/Header";
import NotFound from "../components/NotFound";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default async function GlobalNotFound() {
  // 1. Defina um locale padrão para a página de erro global
  const locale = "pt";

  // 2. Busque as mensagens desse locale
  const messages = await getMessages({ locale });
  return (
    <html lang={locale} className={geistSans.className}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <NotFound />
            {/* <Footer /> */}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
