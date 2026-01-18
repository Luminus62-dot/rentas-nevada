import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ToastContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { I18nProvider } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Rentas Nevada | Encuentra tu hogar en Nevada",
  description: "Plataforma de búsqueda de propiedades en renta en Nevada. Encuentra casas, departamentos y cuartos verificados.",
  keywords: "rentas nevada, casas en renta, departamentos nevada, alquiler las vegas",
  authors: [{ name: "Rentas Nevada" }],
  metadataBase: new URL('https://rentasnevada.com'),
  manifest: '/manifest.json',
  themeColor: '#6366f1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Rentas Nevada',
  },
  openGraph: {
    title: "Rentas Nevada",
    description: "Encuentra tu próximo hogar en Nevada",
    type: "website",
    locale: "es_MX",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="es">
      <head>
        <link rel="dns-prefetch" href="https://idvyhvvimtlxgkgiitmk.supabase.co" />
        <link rel="preconnect" href="https://idvyhvvimtlxgkgiitmk.supabase.co" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen flex flex-col`}>
        {GA_ID && <GoogleAnalytics ga_id={GA_ID} />}
        <Analytics />
        <SpeedInsights />
        <I18nProvider>
          <ToastProvider>
            <NavBar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
