"use client";

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Create a new password"
      subTitle="Your password must be different from previously used passwords"
      backUrl="/login"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
