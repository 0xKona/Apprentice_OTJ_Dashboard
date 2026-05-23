"use client";

import { useAuth } from "@/hooks/use-auth";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { DeleteAccountForm } from "@/components/settings/delete-account-form";

export default function SettingsPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and security settings
        </p>
      </div>
      <ChangePasswordForm />
      <DeleteAccountForm />
    </div>
  );
}
