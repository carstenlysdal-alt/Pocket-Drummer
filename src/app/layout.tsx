import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pocket Drummer · Trommeøve-platform med AI-læringsplaner",
  description: "Pocket Drummer er en dansk abonnementsplatform for trommespillere. Få personlige AI-genererede læringsplaner, interaktive trommenoder og PDF-download.",
  keywords: ["trommer", "trommeundervisning", "trommenoder", "pocket drummer", "AI læringsplan", "musikundervisning"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

import { AuthProvider } from "@/lib/authContext";
import { LanguageProvider } from "@/lib/languageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className="h-full">
      <body className="h-full flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}


