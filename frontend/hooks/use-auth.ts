import { useAuthenticator } from "@aws-amplify/ui-react";
import { AuthUser, signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserAttributes {
  email?: string;
  sub?: string;
  [key: string]: string | undefined;
}

export function useAuth() {
  const router = useRouter();
  const { authStatus, user } = useAuthenticator((context) => [
    context.authStatus,
    context.user,
  ]);

  const isAuthenticated = authStatus === "authenticated";
  const isLoading = authStatus === "configuring";
  const userAttributes = ((user as any)?.attributes as UserAttributes) || null;

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      const errorMsg = `Error signing out: ${error}`
      console.error(errorMsg);
      toast.error(errorMsg);
    }

    try {
      router.replace('/');
      router.refresh();
    } catch (error) {
      const errorMsg = `Error redirecting after sign out: ${error}`
      console.error(errorMsg);
      toast.error(errorMsg);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    userAttributes,
    signout: handleSignOut,
  };
}
