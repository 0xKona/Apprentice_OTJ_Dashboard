"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  confirmSignIn,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "One number" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "One symbol" },
];

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const flow = searchParams.get("flow") || "new-password";
  const username = searchParams.get("username") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isPasswordValid = PASSWORD_RULES.every((r) => r.test(newPassword));
  const passwordsMatch = newPassword === confirmPasswordValue;

  // For RESET_PASSWORD flow: send verification code first
  const handleSendCode = async () => {
    setError("");
    setIsLoading(true);
    try {
      await resetPassword({ username });
      setCodeSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Password does not meet requirements");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      if (flow === "reset") {
        await confirmResetPassword({
          username,
          confirmationCode: code,
          newPassword,
        });
        router.push("/signin");
      } else {
        await confirmSignIn({ challengeResponse: newPassword });
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // RESET_PASSWORD flow: need to send code first
  if (flow === "reset" && !codeSent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Password Reset Required</CardTitle>
            <CardDescription>
              Your account has been migrated to a new system and a password reset is required. We&apos;ll send a verification code to your email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button onClick={handleSendCode} className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Verification Code"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
          <CardDescription>
            {flow === "reset"
              ? "Enter the verification code sent to your email and choose a new password."
              : "Your account requires a new password before you can continue."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {flow === "reset" && (
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter code from email"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPasswordValue}
                onChange={(e) => setConfirmPasswordValue(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <ul className="text-xs space-y-1">
              {PASSWORD_RULES.map((rule) => (
                <li
                  key={rule.label}
                  className={rule.test(newPassword) ? "text-green-600" : "text-muted-foreground"}
                >
                  {rule.test(newPassword) ? "✓" : "○"} {rule.label}
                </li>
              ))}
            </ul>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isPasswordValid || !passwordsMatch || (flow === "reset" && !code)}
            >
              {isLoading ? "Setting password..." : "Set Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
