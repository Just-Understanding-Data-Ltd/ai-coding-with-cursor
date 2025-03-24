"use client";

import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");

  const titles = {
    login: {
      title: "Sign in to your account",
      subTitle: "Welcome back! Enter your credentials to access your account",
    },
    register: {
      title: "Create a new account",
      subTitle: "Join us today and get access to all our features",
    },
  };

  return (
    <AuthLayout
      title={titles[activeTab as keyof typeof titles].title}
      subTitle={titles[activeTab as keyof typeof titles].subTitle}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="register">Create Account</TabsTrigger>
        </TabsList>
        {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
      </Tabs>
    </AuthLayout>
  );
}
