import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "keystroke. — MonkeyType Analytics",
  description:
    "Track your MonkeyType typing progress with comprehensive KPIs, charts, and goal tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-mono antialiased bg-surface-0 text-ink">
        {children}
      </body>
    </html>
  );
}
