import { Suspense } from "react";
import SignInForm from "@/components/auth/signin-form";
import { Skeleton } from "@/components/ui/skeleton";

function AuthSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <SignInForm />
    </Suspense>
  );
}
