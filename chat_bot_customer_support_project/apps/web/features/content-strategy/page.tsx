"use client";

import { ContentStrategyWizard } from "./components/content-strategy-wizard";
import { DashboardView } from "./components/dashboard-view";
import { useState } from "react";
import { ContentStrategyData } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ContentStrategyPage() {
  const [step, setStep] = useState<"input" | "dashboard">("input");
  const [contentData, setContentData] = useState<ContentStrategyData | null>(
    null
  );

  const handleStrategyComplete = (data: ContentStrategyData) => {
    setContentData(data);
    setStep("dashboard");
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Content Strategy</h1>
        <p className="text-muted-foreground text-lg">
          {step === "dashboard" && contentData
            ? `After analyzing ${contentData.totalVideosAnalyzed}+ videos, so you can easily generate effective video content strategies tailored to your business`
            : "Generate data-driven content strategies tailored to your business"}
        </p>
      </div>

      <Tabs
        defaultValue={step}
        value={step}
        onValueChange={(value) => setStep(value as "input" | "dashboard")}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="input">Input</TabsTrigger>
          <TabsTrigger value="dashboard" disabled={!contentData}>
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="mt-12 text-center mx-auto">
          <Card>
            <CardContent>
              <ContentStrategyWizard onComplete={handleStrategyComplete} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          {contentData && <DashboardView data={contentData} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
