import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import ToastProvider from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DocAgent",
  description: "Panel médico de clínica virtual",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F8FAFC] text-[#1E293B]">
        <SessionProviderWrapper>
          {children}
          <ToastProvider />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
