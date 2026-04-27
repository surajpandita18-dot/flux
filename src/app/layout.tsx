import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Flux",
  description: "Flux doesn't just track your cycle — it behaves with you through it.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-gray-950">
        {children}
      </body>
    </html>
  );
}
