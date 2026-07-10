import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trip Planner AI",
  description: "Generatore AI di itinerari di viaggio personalizzati.",
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}