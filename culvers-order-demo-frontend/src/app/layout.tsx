import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ApolloAppProvider from "@/components/ApolloAppProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Culver's Order Demo",
  description: "Demo for Culver's ordering system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ApolloAppProvider>{children}</ApolloAppProvider>
      </body>
    </html>
  );
}
