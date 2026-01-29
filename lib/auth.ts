"use client";

import { getCurrentUser, signOut } from "aws-amplify/auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function isAuthenticated() {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

/**
 * Function to handle user sign out, take a useRouter variable as input for redirects
 * @param router 
 */
export const handleSignOut = async (router: AppRouterInstance) => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
