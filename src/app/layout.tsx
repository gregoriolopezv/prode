import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, IBM_Plex_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const ibmPlexSansHeading = IBM_Plex_Sans({ subsets: ['latin'], variable: '--font-heading' });

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prode v1.0",
  description: "Predict World Cup 2026 matches and compete with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, ibmPlexSansHeading.variable)}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
