import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import "katex/dist/katex.min.css";

import Sidebar from "@/components/sidebar/Sidebar";
import ContentContainer from "@/components/ContentContainter";
import ChatWidget from "@/components/chat/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kin Chong's A Level H2 Physics Interactive Guide",
  description:
    "You can find H2 Physics notes, questions and relevant simulations here",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
      >
        <div className="flex h-screen relative">
          <Sidebar />

          <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
            <ContentContainer>{children}</ContentContainer>
          </main>

          {/* Global H2 Physics AI Tutor */}
          <ChatWidget />
        </div>
      </body>
    </html>
  );
}
