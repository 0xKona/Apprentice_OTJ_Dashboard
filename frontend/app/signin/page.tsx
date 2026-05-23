import { Suspense } from "react";
import SignInForm from "@/components/auth/signin-form";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SignInForm />
    </Suspense>
  );
}
