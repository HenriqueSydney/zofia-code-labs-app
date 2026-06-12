import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./global.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { auth } from "@/auth";
import { SuccessToastComponent } from "@/components/SuccessToastComponent";
import { PermissionDeniedToastComponent } from "@/components/PermissionDeniedToastComponent";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zofia Code Labs",
  description: "Building the future with you",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="pt" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <NextIntlClientProvider>
              <div className="min-h-screen bg-background">{children}</div>
              <Toaster />

              <SuccessToastComponent />
              <Suspense fallback={null}>
                <PermissionDeniedToastComponent />
              </Suspense>
            </NextIntlClientProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
