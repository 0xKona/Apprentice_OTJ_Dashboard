"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Clock, FileText, TrendingUp } from "lucide-react";
import { Footer } from "@/components/footer";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent dark:from-cyan-400/15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent dark:from-indigo-400/15 pointer-events-none" />

      <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-sm z-50 relative">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo_full.svg"
              alt="OTJobber"
              width={140}
              height={40}
              priority
            />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild variant="ghost">
                <Link href="/signin">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-32 pb-16 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Log your
              <span className="block text-primary mt-2">
                Apprenticeship Journey
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track on-the-job hours, document learning experiences, and manage
              your apprenticeship documentation in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <Button asChild size="lg" className="text-lg h-12 px-8">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="text-lg h-12 px-8">
                  <Link href="/signin">
                    Get Started
                    <ArrowRight className="ml-2 size-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg h-12 px-8"
                >
                  <Link href="/signup">Create Account</Link>
                </Button>
              </>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-16">
            <Card>
              <CardContent className="p-6 space-y-3 flex flex-col items-center">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="size-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Track Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Log and monitor your on-the-job training hours with ease
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3 flex flex-col items-center">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="size-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Document Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Record activities, new skills, and learning impact
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3 flex flex-col items-center">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="size-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize your growth with charts and insights
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
