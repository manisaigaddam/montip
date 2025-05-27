import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FrameProvider } from "@/components/farcaster-provider";
import FrameWalletProvider from "@/components/frame-wallet-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Montip",
  description: "A tipping bot for monad on farcaster",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FrameWalletProvider>
          <FrameProvider>
            {children}
          </FrameProvider>
        </FrameWalletProvider>
      </body>
    </html>
  );
}
