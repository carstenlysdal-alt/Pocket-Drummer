import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DrumLab · Trommeøve-platform med AI-læringsplaner",
  description: "DrumLab er en dansk abonnementsplatform for trommespillere. Få personlige AI-genererede læringsplaner, interaktive trommenoder og PDF-download.",
  keywords: ["trommer", "trommeundervisning", "trommenoder", "drumlab", "AI læringsplan", "musikundervisning"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import { AuthProvider } from "@/lib/authContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className="h-full">
      <body className="h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

