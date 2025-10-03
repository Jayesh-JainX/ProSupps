import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import NextTopLoader from "nextjs-toploader";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || "ProSupps - Premium Whey Protein",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "High-quality whey protein supplements for optimal performance and muscle recovery.",
  keywords: [
    "whey protein",
    "supplements",
    "fitness",
    "bodybuilding",
    "nutrition",
    "protein powder",
    "muscle recovery",
    "sports nutrition",
  ],
  authors: [{ name: "ProSupps" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: process.env.NEXT_PUBLIC_SITE_NAME,
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: process.env.NEXT_PUBLIC_SITE_NAME,
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="mx-auto max-w-7xl lg:max-w-[90vw] px-4 sm:px-6 lg:px-8 py-4">
            <NextTopLoader
              color="#FF0000" // Red color
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px #FF0000,0 0 5px #FF0000" // Red shadow
              template='<div class="bar" role="bar"><div class="peg"></div></div> 
  <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
              zIndex={1600}
              showAtBottom={false}
            />

            {children}
            <Footer/>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
