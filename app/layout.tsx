import type { Metadata } from "next";
import "./globals.css";
import { ClientLayoutShell } from "./components/ClientLayoutShell";

export const metadata: Metadata = {
  title: "Shopify Admin - Mommy First USA",
  description: "E-Commerce Admin Management Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col bg-[#f1f1f1]">
        <ClientLayoutShell>{children}</ClientLayoutShell>
      </body>
    </html>
  );
}
