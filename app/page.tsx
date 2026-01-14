"use client";

import { useRouter } from "next/navigation";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">OTJ Dashboard</h1>
          <p className="text-muted-foreground">
            Apprentice On-The-Job Training Management
          </p>
        </div>

        <Authenticator>
          {({ signOut, user }) => {
            if (user) {
              router.push("/dashboard");
              return <></>;
            }
            return <></>;
          }}
        </Authenticator>
      </div>
    </div>
  );
}
