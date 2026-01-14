"use client";

import { getCurrentUser } from "aws-amplify/auth";

export async function isAuthenticated() {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}
