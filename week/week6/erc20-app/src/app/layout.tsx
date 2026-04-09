import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/components/web3/Web3Provider";
import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERC20 튜토리얼 | 블록체인 실습",
  description: "ERC20 토큰 표준을 배우고 직접 만들어보는 인터랙티브 튜토리얼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Web3Provider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-4 text-center text-sm text-muted-foreground">
            블록체인 실습 | ERC20 토큰 튜토리얼
          </footer>
        </Web3Provider>
      </body>
    </html>
  );
}
