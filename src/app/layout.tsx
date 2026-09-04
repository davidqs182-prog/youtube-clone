import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import YtErrorSuppressor from "@/components/YtErrorSuppressor";
import { CursorProvider } from "@/context/CursorContext";
import CustomCursor from "@/components/CustomCursor";

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
        <CursorProvider>
          <YtErrorSuppressor />
          <CustomCursor />
          <AppLayout>{children}</AppLayout>
        </CursorProvider>
      </body>
    </html>
  );
}


