"use client";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subTitle="Enter your email and we'll send you a link to reset your password"
      backUrl="/login"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
