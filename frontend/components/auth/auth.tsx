"use client";

import React from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

// Re-configure Amplify here with SSR support, important for Next.js
Amplify.configure(outputs, { ssr: true });

const Auth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // The Authenticator.Provider makes authentication state available globally
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
};

export default Auth;
