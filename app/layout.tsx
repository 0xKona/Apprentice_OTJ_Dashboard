import { Amplify } from "aws-amplify";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import outputs from "@/amplify_outputs.json";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OTJ Dashboard",
  description: "Apprentice On-The-Job Training Dashboard",
};

Amplify.configure(outputs, { ssr: true });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
