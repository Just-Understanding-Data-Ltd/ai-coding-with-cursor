"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ContentStrategyData } from "../../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Download,
  FileText,
  TrendingUp,
  Users,
  BarChart3,
  Calendar,
  Lightbulb,
} from "lucide-react";

interface ReportTabProps {
  data: ContentStrategyData;
  formatNumber: (num: number) => string;
}

export function ReportTab({ data, formatNumber }: ReportTabProps) {
  const [reportSection, setReportSection] = useState("executive");

  // Funnel stage analysis
  const funnelStageData = [
    { name: "Awareness (Top)", value: 45, color: "#4f46e5" },
    { name: "Consideration (Mid)", value: 30, color: "#8b5cf6" },
    { name: "Conversion (Bottom)", value: 25, color: "#ec4899" },
  ];

  // Generate and download the report as PDF
  const downloadReport = () => {
    // In a real implementation, this would generate a PDF
    alert(
      "Generating PDF report... This would download a complete PDF in a real implementation."
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Strategy Report</h2>
        <Button onClick={downloadReport}>
          <FileText className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>

      <Tabs
        value={reportSection}
        onValueChange={setReportSection}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="executive">
            <TrendingUp className="mr-2 h-4 w-4" />
            Executive Summary
          </TabsTrigger>
          <TabsTrigger value="audience">
            <Users className="mr-2 h-4 w-4" />
            Audience Insights
          </TabsTrigger>
          <TabsTrigger value="funnel">
            <BarChart3 className="mr-2 h-4 w-4" />
            Funnel Analysis
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Lightbulb className="mr-2 h-4 w-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Executive Summary Section */}
        <TabsContent value="executive" className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
                <CardDescription>
                  Key insights from your content strategy analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <h3 className="font-semibold text-lg mb-2">
                    Performance Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mb-4">
                        <p className="mb-2">
                          The analyzed videos have generated{" "}
                          <span className="font-medium">
                            {formatNumber(
                              data.topVideos.reduce(
                                (sum, video) => sum + video.views,
                                0
                              )
                            )}
                          </span>{" "}
                          total views and{" "}
                          <span className="font-medium">
                            {formatNumber(
                              data.topVideos.reduce(
                                (sum, video) =>
                                  sum +
                                  video.likes +
                                  video.comments +
                                  video.shares,
                                0
                              )
                            )}
                          </span>{" "}
                          total engagements.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">
                            Total Videos Analyzed:
                          </span>
                          <span className="font-medium">
                            {data.totalVideosAnalyzed}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">
                            Average Engagement Rate:
                          </span>
                          <span className="font-medium">
                            {(
                              data.topVideos.reduce(
                                (sum, video) => sum + video.engagement,
                                0
                              ) / data.topVideos.length
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">
                            Top Performing Platform:
                          </span>
                          <span className="font-medium">
                            {
                              Object.entries(
                                data.topVideos.reduce(
                                  (acc, video) => {
                                    acc[video.platform] =
                                      (acc[video.platform] || 0) + 1;
                                    return acc;
                                  },
                                  {} as Record<string, number>
                                )
                              ).sort((a, b) => b[1] - a[1])[0][0]
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        Top Content Themes
                      </h4>
                      <div className="space-y-2">
                        {data.contentThemes.slice(0, 3).map((theme) => (
                          <div
                            key={theme.id}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm">{theme.name}</span>
                            <Badge
                              variant={
                                theme.performance > 85 ? "default" : "outline"
                              }
                            >
                              {theme.performance}/100
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <h3 className="font-semibold text-lg mb-2">Key Findings</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>
                      Videos between 30-45 seconds have 2.3x higher engagement
                      than longer content
                    </li>
                    <li>
                      Content posted between 6-8pm receives 40% more views on
                      average
                    </li>
                    <li>
                      Using 4-6 hashtags per post results in 28% higher
                      discovery rates
                    </li>
                    <li>
                      Videos that start with a question have 1.7x higher
                      completion rates
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Audience Insights Section */}
        <TabsContent value="audience" className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Audience Insights</CardTitle>
                <CardDescription>
                  Understanding your audience and their engagement patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <h3 className="font-semibold text-lg mb-2">
                    Engagement Patterns
                  </h3>
                  <p className="mb-4">
                    Analysis of when and how your audience engages with your
                    content
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border">
                      <h4 className="font-medium mb-1">
                        Peak Engagement Times
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        <p>Weekdays: 6pm - 9pm</p>
                        <p>Weekends: 11am - 2pm</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Funnel Analysis Section */}
        <TabsContent value="funnel" className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Marketing Funnel Analysis</CardTitle>
                <CardDescription>
                  How your content performs across different stages of the
                  customer journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <h3 className="font-semibold text-lg mb-2">
                    Funnel Stage Distribution
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={funnelStageData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                          >
                            {funnelStageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value}%`, "Percentage"]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">
                          Top Funnel (Awareness) - 45%
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Educational content and trend participation videos
                          perform best for brand awareness.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">
                          Mid Funnel (Consideration) - 30%
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Product demonstrations and tutorials drive the highest
                          engagement in the consideration stage.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">
                          Bottom Funnel (Conversion) - 25%
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          User testimonials and limited-time offers generate the
                          most conversions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <h3 className="font-semibold text-lg mb-2">
                    Content Journey Mapping
                  </h3>
                  <p className="mb-2">
                    Optimal content sequence based on customer journey analysis:
                  </p>
                  <div className="relative pt-6">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded">
                      <div
                        className="absolute top-0 left-0 h-1 bg-primary rounded"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="p-3 rounded-lg border border-primary">
                        <Badge className="mb-2">Stage 1</Badge>
                        <h4 className="font-medium mb-1">
                          Educational Content
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Builds awareness and establishes expertise
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <Badge variant="outline" className="mb-2">
                          Stage 2
                        </Badge>
                        <h4 className="font-medium mb-1">
                          Product Demonstrations
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Showcases benefits and use cases
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <Badge variant="outline" className="mb-2">
                          Stage 3
                        </Badge>
                        <h4 className="font-medium mb-1">
                          Testimonials & Offers
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Drives conversion through social proof
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Recommendations Section */}
        <TabsContent value="recommendations" className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Strategic Recommendations</CardTitle>
                <CardDescription>
                  Data-driven suggestions to optimize your content strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <h3 className="font-semibold text-lg mb-2">
                    Content Optimization
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border border-primary/20 bg-white">
                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            Optimal Posting Schedule
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Increase posting frequency to 4-5 times per week,
                            focusing on Tuesday and Thursday evenings (6-8pm)
                            when your audience is most active.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-primary/20 bg-white">
                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Content Format Mix</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Allocate 50% to tutorial content, 30% to product
                            showcases, and 20% to user testimonials based on
                            current performance metrics.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-primary/20 bg-white">
                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Lightbulb className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            Content Themes to Explore
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Based on trending topics and audience engagement,
                            focus on "Sustainable Beauty", "Quick Routines", and
                            "Ingredient Education" themes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <h3 className="font-semibold text-lg mb-2">
                    Recommended Video Types
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border-b">
                      <div>
                        <span className="font-medium">
                          Before & After Transformations
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Show product results with real customers
                        </p>
                      </div>
                      <Badge>High Impact</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border-b">
                      <div>
                        <span className="font-medium">
                          Ingredient Spotlight Series
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Educational videos about key ingredients
                        </p>
                      </div>
                      <Badge variant="outline">Medium Impact</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border-b">
                      <div>
                        <span className="font-medium">
                          Quick Application Tutorials
                        </span>
                        <p className="text-xs text-muted-foreground">
                          30-second product application guides
                        </p>
                      </div>
                      <Badge>High Impact</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2">
                      <div>
                        <span className="font-medium">
                          Skincare Myth Busters
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Debunking common misconceptions
                        </p>
                      </div>
                      <Badge>High Impact</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={downloadReport}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Detailed Recommendations
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
