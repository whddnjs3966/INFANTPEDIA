import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Noto_Sans_KR } from "next/font/google";
import { cn } from "@/lib/utils";
import ClientLayout from "@/components/layout/ClientLayout";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InfantPedia - \uc601\uc720\uc544 \uc885\ud569 \ubc31\uacfc\uc0ac\uc804",
  description:
    "\uc2e0\uc0dd\uc544\ubd80\ud130 \uc0dd\ud6c4 12\uac1c\uc6d4\uae4c\uc9c0, \uc544\uae30\uc758 \uc131\uc7a5 \ub2e8\uacc4\uc5d0 \ub9de\ucd98 \uc2e4\uc804 \uc721\uc544 \ubc31\uacfc\uc0ac\uc804",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "\uc778\ud380\ud2b8\ud53c\ub514\uc544",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F472B6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("font-sans", notoSansKr.variable)} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = JSON.parse(localStorage.getItem('theme-storage') || '{}');
                if (stored.state?.theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
