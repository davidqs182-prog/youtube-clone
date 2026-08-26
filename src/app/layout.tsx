import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import YtErrorSuppressor from "@/components/YtErrorSuppressor";

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "YouTube Clone",
  description: "A pixel-perfect YouTube clone with smart video feed.",
  themeColor: "#0f0f0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} dark antialiased`} style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-[#0f0f0f] text-[#f1f1f1] overflow-hidden">
        <YtErrorSuppressor />
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}

