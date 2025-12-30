import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import ScrollToTop from "../components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FyiCast | Forecast Smarter",
  description:
    "FyiCast helps small and medium-sized businesses turn historical financial data into clear monthly and yearly forecasts, scenario plans, and actionable insights.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyInlineGap = "3rem";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ "--page-inline-gap": bodyInlineGap } as React.CSSProperties}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
        <ScrollToTop />
      </body>
    </html>
  );
}
