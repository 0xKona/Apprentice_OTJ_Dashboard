import { Suspense } from "react";
import SignUpForm from "@/components/auth/signup-form";
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

export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <SignUpForm />
    </Suspense>
  );
}
