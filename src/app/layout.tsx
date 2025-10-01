import "./globals.css";
import { Providers } from "./Providers";
import type { Viewport } from "next";
import { Metadata } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Livo - Blood Morphology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      {/* allow vertical scroll; avoid full lock on small screens */}
      <body className="min-h-dvh overflow-x-hidden antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
