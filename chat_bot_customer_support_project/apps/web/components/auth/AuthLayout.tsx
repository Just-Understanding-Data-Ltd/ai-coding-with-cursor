"use client";

import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { config } from "@/config";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subTitle?: string;
  backUrl?: string;
}

export function AuthLayout({
  children,
  title,
  subTitle,
  backUrl = "/",
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-[480px] space-y-8 px-5 sm:px-6">
        <div className="flex items-center justify-between">
          <Link href={backUrl}>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 rounded-full h-9 px-4 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {config.name}
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-all dark:border-gray-800 dark:bg-gray-900">
          <div className="p-8">
            {title && (
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                {subTitle && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {subTitle}
                  </p>
                )}
              </div>
            )}
            {children}
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} {config.name}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
