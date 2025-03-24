"use client";

import { HydrationBoundary, DehydratedState } from "@tanstack/react-query";
import { LoadingSkeleton } from "@/components/loading/loading-skeleton";
import { Suspense } from "react";
import { useUsers } from "@repo/supabase";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface DashboardProps {
  dehydratedState: DehydratedState;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 mb-8">
      <div className="space-y-4">
        {/* Name text skeleton */}
        <LoadingSkeleton variant="text" width="200px" />
        {/* Button skeleton */}
        <LoadingSkeleton variant="button" />
      </div>
    </div>
  );
}

function DashboardContent() {
  const supabase = createClient();
  const { data } = useUsers({ supabase });
  const router = useRouter();
  const params = useParams();

  const orgId = typeof params.orgId === "string" ? params.orgId : "";
  const teamId = typeof params.teamId === "string" ? params.teamId : "";

  if (!data) {
    return <DashboardSkeleton />;
  }

  const navigateToChat = () => {
    router.push(`/org/${orgId}/${teamId}/chat`);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Dashboard</CardTitle>
            <CardDescription>
              Your team dashboard provides an overview of your project's status
              and key metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have {data.length} team{" "}
              {data.length === 1 ? "member" : "members"} in your organization.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <CardTitle>Introducing Your AI Chat Assistant</CardTitle>
            </div>
            <CardDescription className="text-base">
              Enhance your workflow with our AI-powered chat assistant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our intelligent chat assistant helps you and your team be more
              productive by:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Answering questions about your project instantly</li>
              <li>Providing suggestions and ideas when you need inspiration</li>
              <li>Helping you automate repetitive tasks</li>
              <li>Collaborating with your team in real-time</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              onClick={navigateToChat}
              className="w-full sm:w-auto"
              size="lg"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Try AI Chat Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard({ dehydratedState }: DashboardProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </HydrationBoundary>
  );
}
