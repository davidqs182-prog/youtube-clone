import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "YouTube Clone",
  description: "A pixel-perfect YouTube clone with smart video feed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} antialiased`} suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-[var(--yt-bg)] text-[var(--yt-text)] overflow-hidden">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
