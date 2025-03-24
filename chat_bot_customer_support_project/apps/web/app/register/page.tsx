"use client";

import RegisterForm from "@/components/auth/RegisterForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create a new account"
      subTitle="Join us today and get access to all our features"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
