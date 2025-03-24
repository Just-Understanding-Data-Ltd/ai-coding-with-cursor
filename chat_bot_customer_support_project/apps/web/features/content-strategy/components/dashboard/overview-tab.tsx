"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ContentStrategyData, ContentTheme, ContentFormat } from "../../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import {
  Eye,
  Sparkles,
  TrendingUp,
  Video,
  MessageSquare,
  Download,
  Hash,
} from "lucide-react";

interface OverviewTabProps {
  data: ContentStrategyData;
  formatNumber: (num: number) => string;
}

export function OverviewTab({ data, formatNumber }: OverviewTabProps) {
  const [selectedTheme, setSelectedTheme] = useState<ContentTheme | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat | null>(
    null
  );

  // Add additional theme and format options to the data
  const extendedThemes = [...data.contentThemes];
  const extendedFormats = [...data.contentFormats];

  // Add additional themes if we don't have enough (aiming for 15 total)
  if (extendedThemes.length < 15) {
    const additionalThemes = [
      {
        id: "theme-extended-1",
        name: "Skincare Solutions",
        performance: 88,
        videoCount: 21,
        averageEngagement: 4.3,
        topHashtags: ["#skincare", "#skintips", "#behindthescenes"],
      },
      {
        id: "theme-extended-2",
        name: "Acne Prevention",
        performance: 92,
        videoCount: 18,
        averageEngagement: 4.7,
        topHashtags: ["#acne", "#clearskin", "#meettheteam"],
      },
      {
        id: "theme-extended-3",
        name: "Anti-Aging Treatments",
        performance: 86,
        videoCount: 24,
        averageEngagement: 4.1,
        topHashtags: ["#antiaging", "#skincare", "#office"],
      },
      {
        id: "theme-extended-4",
        name: "Natural Ingredients",
        performance: 89,
        videoCount: 31,
        averageEngagement: 4.5,
        topHashtags: ["#natural", "#behindthescenes", "#cleanbeauty"],
      },
      {
        id: "theme-extended-5",
        name: "Skin Protection",
        performance: 85,
        videoCount: 27,
        averageEngagement: 4.2,
        topHashtags: ["#sunscreen", "#office", "#skinprotection"],
      },
      {
        id: "theme-extended-6",
        name: "Makeup Application",
        performance: 82,
        videoCount: 23,
        averageEngagement: 3.9,
        topHashtags: ["#makeup", "#meettheteam", "#beautytips"],
      },
      {
        id: "theme-extended-7",
        name: "Skin Hydration",
        performance: 87,
        videoCount: 29,
        averageEngagement: 4.4,
        topHashtags: ["#hydration", "#behindthescenes", "#skincare"],
      },
      {
        id: "theme-extended-8",
        name: "Product Dupes",
        performance: 91,
        videoCount: 33,
        averageEngagement: 4.6,
        topHashtags: ["#dupes", "#office", "#budgetbeauty"],
      },
      {
        id: "theme-extended-9",
        name: "Sensitive Skin Care",
        performance: 84,
        videoCount: 22,
        averageEngagement: 4.0,
        topHashtags: ["#sensitiveskin", "#meettheteam", "#skincaretips"],
      },
      {
        id: "theme-extended-10",
        name: "Men's Skincare",
        performance: 80,
        videoCount: 19,
        averageEngagement: 3.8,
        topHashtags: ["#mensskincare", "#behindthescenes", "#grooming"],
      },
    ];

    // Add as many additional themes as needed to reach 15
    extendedThemes.push(
      ...additionalThemes.slice(0, 15 - extendedThemes.length)
    );
  }

  // Add additional formats if we don't have enough (aiming for 15 total)
  if (extendedFormats.length < 15) {
    const additionalFormats = [
      {
        id: "format-extended-1",
        name: "Before & After Reveals",
        performance: 93,
        videoCount: 28,
        averageEngagement: 4.8,
        description: "Showcasing dramatic skin transformations and results.",
      },
      {
        id: "format-extended-2",
        name: "Expert Interviews",
        performance: 85,
        videoCount: 22,
        averageEngagement: 4.2,
        description:
          "Discussions with dermatologists and skincare professionals.",
      },
      {
        id: "format-extended-3",
        name: "Product Unboxing",
        performance: 88,
        videoCount: 31,
        averageEngagement: 4.4,
        description:
          "Unpacking and first impressions of new skincare products.",
      },
      {
        id: "format-extended-4",
        name: "Ingredient Spotlight",
        performance: 87,
        videoCount: 25,
        averageEngagement: 4.3,
        description:
          "Deep dives into specific skincare ingredients and benefits.",
      },
      {
        id: "format-extended-5",
        name: "Comparison Reviews",
        performance: 91,
        videoCount: 27,
        averageEngagement: 4.7,
        description: "Side-by-side comparisons of similar products.",
      },
      {
        id: "format-extended-6",
        name: "Skincare Myths Debunked",
        performance: 89,
        videoCount: 24,
        averageEngagement: 4.5,
        description: "Separating skincare facts from fiction.",
      },
      {
        id: "format-extended-7",
        name: "Quick Tips",
        performance: 83,
        videoCount: 35,
        averageEngagement: 4.0,
        description: "Fast, actionable advice in under 30 seconds.",
      },
      {
        id: "format-extended-8",
        name: "Routine Builds",
        performance: 86,
        videoCount: 26,
        averageEngagement: 4.3,
        description: "Building full skincare routines for specific needs.",
      },
      {
        id: "format-extended-9",
        name: "Seasonal Skincare",
        performance: 82,
        videoCount: 20,
        averageEngagement: 3.9,
        description: "How to adjust skincare for different seasons.",
      },
      {
        id: "format-extended-10",
        name: "Travel Skincare",
        performance: 81,
        videoCount: 18,
        averageEngagement: 3.8,
        description: "Skincare tips and products for when you're on the go.",
      },
    ];

    // Add as many additional formats as needed to reach 15
    extendedFormats.push(
      ...additionalFormats.slice(0, 15 - extendedFormats.length)
    );
  }

  // Calculate total engagement metrics
  const totalLikes = data.topVideos.reduce(
    (sum, video) => sum + video.likes,
    0
  );
  const totalComments = data.topVideos.reduce(
    (sum, video) => sum + video.comments,
    0
  );
  const totalShares = data.topVideos.reduce(
    (sum, video) => sum + video.shares,
    0
  );

  // Prepare data for charts
  const themePerformanceData = extendedThemes
    .map((theme) => ({
      name: theme.name,
      value: theme.performance,
      videoCount: theme.videoCount,
      engagement: theme.averageEngagement.toFixed(1),
    }))
    .sort((a, b) => b.value - a.value);

  const formatPerformanceData = extendedFormats
    .map((format) => ({
      name: format.name,
      value: format.performance,
      videoCount: format.videoCount,
      engagement: format.averageEngagement.toFixed(1),
    }))
    .sort((a, b) => b.value - a.value);

  const engagementDistributionData = [
    { name: "Likes", value: totalLikes, color: "#f43f5e" },
    { name: "Comments", value: totalComments, color: "#f97316" },
    { name: "Shares", value: totalShares, color: "#facc15" },
  ];

  // Topic analysis data
  const topicAnalysisData = [
    {
      topic: "Skincare Routines",
      frequency: 78,
      engagement: 92,
    },
    { topic: "Product Reviews", frequency: 65, engagement: 88 },
    {
      topic: "Ingredient Education",
      frequency: 52,
      engagement: 85,
    },
    { topic: "Skin Concerns", frequency: 48, engagement: 79 },
    { topic: "Beauty Tips", frequency: 42, engagement: 76 },
  ];

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

  // Sample comment insights data
  const commentInsights = {
    frequentQuestions: [
      { question: "What ingredients are in this product?", frequency: 32 },
      { question: "Does this work for sensitive skin?", frequency: 28 },
      { question: "How long does it take to see results?", frequency: 24 },
      { question: "Is this product cruelty-free?", frequency: 19 },
    ],
    contentIdeas: [
      {
        idea: "Ingredient breakdown video",
        source: "Multiple ingredient questions",
        engagement: 87,
      },
      {
        idea: "Sensitive skin routine guide",
        source: "Questions about skin types",
        engagement: 82,
      },
      {
        idea: "Results timeline expectations",
        source: "Questions about timing",
        engagement: 79,
      },
      {
        idea: "Behind-the-scenes of testing process",
        source: "Questions about testing",
        engagement: 75,
      },
    ],
    sentimentAnalysis: {
      positive: 68,
      neutral: 24,
      negative: 8,
    },
    topKeywords: [
      { word: "amazing", count: 87 },
      { word: "love", count: 76 },
      { word: "results", count: 65 },
      { word: "recommend", count: 52 },
      { word: "price", count: 43 },
    ],
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6"
    >
      {/* Content Themes - Full width */}
      <motion.div variants={itemVariants}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Top Performing Themes
            </CardTitle>
            <CardDescription>
              Content themes with the highest engagement rates - showing 10 out
              of 1287 videos for competitor analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={themePerformanceData.slice(0, 10)}
                  margin={{ top: 20, right: 60, left: 40, bottom: 70 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value, name, props) => {
                      if (name === "value")
                        return [`${value}/100`, "Performance"];
                      return [value, name];
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const theme = extendedThemes.find(
                          (t) => t.name === payload[0].payload.name
                        );
                        return (
                          <div className="bg-background p-4 border rounded-md shadow-sm space-y-2 max-w-[300px]">
                            <p className="font-medium text-lg">
                              {payload[0].payload.name}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                Performance Score
                              </span>
                              <Badge
                                variant={
                                  parseInt(String(payload[0].value)) > 85
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {payload[0].value}/100
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Videos
                              </span>
                              <span className="font-medium">
                                {payload[0].payload.videoCount}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Avg Engagement
                              </span>
                              <span className="font-medium">
                                {payload[0].payload.engagement}
                              </span>
                            </div>
                            {theme && theme.topHashtags && (
                              <div className="pt-2">
                                <p className="text-sm text-muted-foreground mb-1">
                                  Top Hashtags
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {theme.topHashtags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground pt-2 italic">
                              Click on a bar to see more details
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name="Performance Score"
                    fill="#4f46e5"
                    radius={[0, 4, 4, 0]}
                    onClick={(data) => {
                      const theme = extendedThemes.find(
                        (t) => t.name === data.name
                      );
                      if (theme) {
                        setSelectedTheme(
                          theme === selectedTheme ? null : theme
                        );
                      }
                    }}
                    cursor="pointer"
                  >
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={(value: number) => `${value}/100`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-2">
            <p className="text-sm text-muted-foreground">
              Hover over bars for details or click to see more information about
              a theme
            </p>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Selected Theme Details */}
      {selectedTheme && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  {selectedTheme.name}
                </CardTitle>
                <Badge
                  variant={
                    selectedTheme.performance > 85 ? "default" : "outline"
                  }
                >
                  {selectedTheme.performance}/100
                </Badge>
              </div>
              <CardDescription>
                Detailed analysis and insights for this content theme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Video Count
                  </h4>
                  <p className="text-2xl font-bold">
                    {selectedTheme.videoCount}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4 border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Avg Engagement
                  </h4>
                  <p className="text-2xl font-bold">
                    {selectedTheme.averageEngagement.toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="bg-background rounded-lg p-4 border">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Top Hashtags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTheme.topHashtags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="bg-background rounded-lg p-4 border">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Content Strategy Tips
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {selectedTheme.name === "Product Demonstrations" && (
                    <>
                      <li>
                        Focus on educational content that clearly explains
                        product benefits
                      </li>
                      <li>
                        Use close-up shots to showcase product details and
                        texture
                      </li>
                      <li>
                        Include application techniques and proper usage
                        instructions
                      </li>
                      <li>
                        Address common customer concerns about the product
                      </li>
                    </>
                  )}
                  {selectedTheme.name === "Behind the Scenes" && (
                    <>
                      <li>
                        Show authentic, unscripted moments that humanize your
                        brand
                      </li>
                      <li>
                        Highlight your team's expertise and passion for skincare
                      </li>
                      <li>
                        Share the science and research behind your formulations
                      </li>
                      <li>
                        Take viewers through your product development process
                      </li>
                    </>
                  )}
                  {selectedTheme.name === "Customer Testimonials" && (
                    <>
                      <li>
                        Feature before/after visuals to showcase real results
                      </li>
                      <li>Include diverse skin types, ages, and concerns</li>
                      <li>
                        Let customers explain their experience in their own
                        words
                      </li>
                      <li>Highlight specific benefits and transformations</li>
                    </>
                  )}
                  {selectedTheme.name === "Skincare Routines" && (
                    <>
                      <li>
                        Break down each step of the routine with timing
                        recommendations
                      </li>
                      <li>
                        Explain the purpose and benefits of each product used
                      </li>
                      <li>
                        Customize routines for different skin types and concerns
                      </li>
                      <li>
                        Show application techniques for maximum product
                        effectiveness
                      </li>
                    </>
                  )}
                  {selectedTheme.name === "Ingredient Education" && (
                    <>
                      <li>
                        Highlight scientific research supporting key ingredients
                      </li>
                      <li>
                        Explain how ingredients work synergistically together
                      </li>
                      <li>
                        Address common misconceptions about skincare ingredients
                      </li>
                      <li>
                        Use visual aids to explain ingredient mechanisms of
                        action
                      </li>
                    </>
                  )}
                  {selectedTheme.name.includes("Acne") && (
                    <>
                      <li>Focus on scientific approaches to acne management</li>
                      <li>
                        Show the progressive journey of acne healing with
                        timeline expectations
                      </li>
                      <li>Interview dermatologists for expert credibility</li>
                      <li>Address emotional aspects of dealing with acne</li>
                    </>
                  )}
                  {selectedTheme.name.includes("Anti-Aging") && (
                    <>
                      <li>
                        Educate on the science of aging and preventative
                        measures
                      </li>
                      <li>
                        Feature long-term results with consistent skincare
                        routines
                      </li>
                      <li>
                        Compare different anti-aging ingredients and their
                        efficacy
                      </li>
                      <li>
                        Include proper application techniques to maximize
                        benefits
                      </li>
                    </>
                  )}
                  {(selectedTheme.name.includes("Natural") ||
                    selectedTheme.name.includes("DIY")) && (
                    <>
                      <li>
                        Highlight the sourcing and quality of natural
                        ingredients
                      </li>
                      <li>
                        Demonstrate making simple DIY products with kitchen
                        ingredients
                      </li>
                      <li>
                        Discuss preservation methods and shelf-life
                        considerations
                      </li>
                      <li>
                        Explain which skin concerns are best addressed with
                        natural solutions
                      </li>
                    </>
                  )}
                  {selectedTheme.name.includes("Skin Protection") && (
                    <>
                      <li>
                        Educate on the different types of UV rays and their
                        effects
                      </li>
                      <li>
                        Demonstrate proper sunscreen application and
                        reapplication
                      </li>
                      <li>
                        Discuss additional protective measures beyond sunscreen
                      </li>
                      <li>Address common sunscreen myths and misconceptions</li>
                    </>
                  )}
                  {!selectedTheme.name.match(
                    /Product Demonstrations|Behind the Scenes|Customer Testimonials|Skincare Routines|Ingredient Education|Acne|Anti-Aging|Natural|DIY|Skin Protection/
                  ) && (
                    <>
                      <li>
                        Focus on educational content that explains the benefits
                      </li>
                      <li>Use before and after visuals when applicable</li>
                      <li>Highlight expert opinions and scientific research</li>
                      <li>Address common audience questions and concerns</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Content Formats - Full width */}
      <motion.div variants={itemVariants}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5 text-primary" />
              Top Content Formats
            </CardTitle>
            <CardDescription>
              Most effective content formats by performance - essential for
              content strategy planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formatPerformanceData.slice(0, 10)}
                  margin={{ top: 20, right: 60, left: 40, bottom: 70 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value, name, props) => {
                      if (name === "value")
                        return [`${value}/100`, "Performance"];
                      return [value, name];
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const format = extendedFormats.find(
                          (f) => f.name === payload[0].payload.name
                        );
                        return (
                          <div className="bg-background p-4 border rounded-md shadow-sm space-y-2 max-w-[300px]">
                            <p className="font-medium text-lg">
                              {payload[0].payload.name}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                Performance Score
                              </span>
                              <Badge
                                variant={
                                  parseInt(String(payload[0].value)) > 85
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {payload[0].value}/100
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Videos
                              </span>
                              <span className="font-medium">
                                {payload[0].payload.videoCount}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Avg Engagement
                              </span>
                              <span className="font-medium">
                                {payload[0].payload.engagement}
                              </span>
                            </div>
                            {format && format.description && (
                              <div className="pt-2">
                                <p className="text-sm text-muted-foreground mb-1">
                                  Description
                                </p>
                                <p className="text-sm">{format.description}</p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground pt-2 italic">
                              Click on a bar to see more details
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name="Performance Score"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                    onClick={(data) => {
                      const format = extendedFormats.find(
                        (f) => f.name === data.name
                      );
                      if (format) {
                        setSelectedFormat(
                          format === selectedFormat ? null : format
                        );
                      }
                    }}
                    cursor="pointer"
                  >
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={(value: number) => `${value}/100`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-2">
            <p className="text-sm text-muted-foreground">
              Hover over bars for details or click to see more information about
              a format
            </p>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Selected Format Details */}
      {selectedFormat && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Video className="mr-2 h-5 w-5 text-primary" />
                  {selectedFormat.name}
                </CardTitle>
                <Badge
                  variant={
                    selectedFormat.performance > 85 ? "default" : "outline"
                  }
                >
                  {selectedFormat.performance}/100
                </Badge>
              </div>
              <CardDescription>
                Detailed analysis and best practices for this content format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Video Count
                  </h4>
                  <p className="text-2xl font-bold">
                    {selectedFormat.videoCount}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4 border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Avg Engagement
                  </h4>
                  <p className="text-2xl font-bold">
                    {selectedFormat.averageEngagement.toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="bg-background rounded-lg p-4 border">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Description
                </h4>
                <p>{selectedFormat.description}</p>
              </div>
              <div className="bg-background rounded-lg p-4 border">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Best Practices
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {selectedFormat.name === "Tutorial Videos" && (
                    <>
                      <li>
                        Start with the end result to capture immediate interest
                      </li>
                      <li>
                        Break down steps clearly with on-screen text for each
                        stage
                      </li>
                      <li>Use close-ups for detailed application techniques</li>
                      <li>
                        Include common mistakes to avoid during the process
                      </li>
                      <li>
                        End with a product recommendation or routine suggestion
                      </li>
                    </>
                  )}
                  {selectedFormat.name === "Before & After" && (
                    <>
                      <li>
                        Use consistent lighting and angles for credible
                        comparisons
                      </li>
                      <li>
                        Show realistic timeframes for results (days, weeks,
                        months)
                      </li>
                      <li>
                        Include details about the consistent routine followed
                      </li>
                      <li>Address potential variables that affected results</li>
                      <li>
                        Be transparent about what users can realistically expect
                      </li>
                    </>
                  )}
                  {selectedFormat.name === "Day in the Life" && (
                    <>
                      <li>
                        Capture authentic morning and evening skincare routines
                      </li>
                      <li>
                        Show how skincare fits into your overall daily schedule
                      </li>
                      <li>
                        Include quick tips for on-the-go skincare maintenance
                      </li>
                      <li>
                        Highlight lifestyle factors that impact skin health
                      </li>
                      <li>
                        Create a relatable narrative that viewers can connect
                        with
                      </li>
                    </>
                  )}
                  {selectedFormat.name === "Expert Interviews" && (
                    <>
                      <li>
                        Prepare concise, focused questions about specific
                        skincare topics
                      </li>
                      <li>Include the expert's credentials and background</li>
                      <li>
                        Break complex scientific concepts into digestible
                        explanations
                      </li>
                      <li>
                        Address common myths and misconceptions in the field
                      </li>
                      <li>Conclude with the expert's top recommendations</li>
                    </>
                  )}
                  {selectedFormat.name === "Product Unboxing" && (
                    <>
                      <li>Capture genuine first impressions and reactions</li>
                      <li>Discuss packaging, texture, and sensory aspects</li>
                      <li>Compare to similar products in your collection</li>
                      <li>Perform a patch test on camera when appropriate</li>
                      <li>Explain who would benefit most from the product</li>
                    </>
                  )}
                  {selectedFormat.name.includes("Review") && (
                    <>
                      <li>
                        Establish clear review criteria (efficacy, value,
                        experience)
                      </li>
                      <li>Share your testing methodology and duration</li>
                      <li>Show close-ups of product texture and application</li>
                      <li>
                        Discuss both pros and cons for balanced assessment
                      </li>
                      <li>Rate products on a consistent, transparent scale</li>
                    </>
                  )}
                  {selectedFormat.name.includes("Myths") && (
                    <>
                      <li>Research each myth thoroughly before debunking</li>
                      <li>
                        Cite credible scientific sources for your explanations
                      </li>
                      <li>Use simple visual demonstrations when possible</li>
                      <li>
                        Provide practical alternatives to common misconceptions
                      </li>
                      <li>Address why these myths are so persistent</li>
                    </>
                  )}
                  {selectedFormat.name.includes("Tips") ||
                    (selectedFormat.name.includes("Routine") && (
                      <>
                        <li>
                          Keep each tip concise and immediately actionable
                        </li>
                        <li>Group related tips into themed segments</li>
                        <li>Use text overlays to reinforce key points</li>
                        <li>
                          Demonstrate the application or technique for each tip
                        </li>
                        <li>
                          Provide product recommendations at different price
                          points
                        </li>
                      </>
                    ))}
                  {selectedFormat.name.includes("Seasonal") && (
                    <>
                      <li>
                        Explain how weather changes affect skin conditions
                      </li>
                      <li>
                        Demonstrate how to transition routines between seasons
                      </li>
                      <li>
                        Recommend specific product adjustments for the season
                      </li>
                      <li>
                        Address common seasonal skin concerns (dryness, sun
                        damage)
                      </li>
                      <li>
                        Provide preventative care tips for upcoming seasonal
                        changes
                      </li>
                    </>
                  )}
                  {!selectedFormat.name.match(
                    /Tutorial Videos|Before & After|Day in the Life|Expert Interviews|Product Unboxing|Review|Myths|Tips|Routine|Seasonal/
                  ) && (
                    <>
                      <li>Keep videos concise and focused on a single topic</li>
                      <li>Use clear, attention-grabbing titles</li>
                      <li>Include a strong call-to-action</li>
                      <li>
                        Optimize first 3 seconds to capture viewer attention
                      </li>
                      <li>Use on-screen text to reinforce key points</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Topic Analysis Section */}
      <motion.div variants={itemVariants} className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hash className="mr-2 h-5 w-5 text-primary" />
              Topic Analysis
            </CardTitle>
            <CardDescription>
              Performance breakdown of key topics in your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Topic</th>
                    <th className="text-center py-3 px-4">Frequency</th>
                    <th className="text-center py-3 px-4">Engagement Score</th>
                  </tr>
                </thead>
                <tbody>
                  {topicAnalysisData.map((topic, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{topic.topic}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          <span className="inline-block w-12 h-2 bg-gray-200 rounded-full mr-2">
                            <span
                              className="block h-full bg-primary rounded-full"
                              style={{ width: `${topic.frequency}%` }}
                            ></span>
                          </span>
                          <span>{topic.frequency}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            topic.engagement > 80 ? "default" : "outline"
                          }
                        >
                          {topic.engagement}/100
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Topic Insights</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Based on analysis of scraped videos in your niche:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>
                    <strong>Skincare Routines</strong> is the highest performing
                    topic with consistent growth in the analyzed videos
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>
                    <strong>Ingredient Education</strong> shows the fastest
                    growth rate and could be a strategic focus area
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>
                    Videos about <strong>Product Reviews</strong> receive high
                    engagement across the analyzed content
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Comments Insights Section */}
      <motion.div variants={itemVariants} className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              Comments Insights
            </CardTitle>
            <CardDescription>
              Valuable insights extracted from audience comments and questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <h3 className="text-base font-medium">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-5">
                  {commentInsights.frequentQuestions.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-5 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <span className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span>{item.question}</span>
                      </div>
                      <Badge variant="outline">{item.frequency}x</Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <h3 className="text-base font-medium mb-5">
                    Comment Sentiment Analysis
                  </h3>
                  <div className="space-y-5 p-5 border rounded-lg bg-muted/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                        Positive
                      </span>
                      <span className="text-sm font-medium">
                        {commentInsights.sentimentAnalysis.positive}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{
                          width: `${commentInsights.sentimentAnalysis.positive}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm flex items-center">
                        <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                        Neutral
                      </span>
                      <span className="text-sm font-medium">
                        {commentInsights.sentimentAnalysis.neutral}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gray-400 h-2.5 rounded-full"
                        style={{
                          width: `${commentInsights.sentimentAnalysis.neutral}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm flex items-center">
                        <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                        Negative
                      </span>
                      <span className="text-sm font-medium">
                        {commentInsights.sentimentAnalysis.negative}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{
                          width: `${commentInsights.sentimentAnalysis.negative}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-base font-medium">
                  Content Ideas from Comments
                </h3>
                <div className="space-y-5">
                  {commentInsights.contentIdeas.map((item, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{item.idea}</h4>
                        <Badge
                          variant={item.engagement > 80 ? "default" : "outline"}
                        >
                          {item.engagement}/100
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Based on: {item.source}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  {/* Hiding Top Keywords in Comments section as requested */}
                  {/* <h3 className="text-base font-medium mb-5">
                    Top Keywords in Comments
                  </h3>
                  <div className="flex flex-wrap gap-4 p-5 border rounded-lg bg-muted/10">
                    {commentInsights.topKeywords.map((keyword, index) => (
                      <div
                        key={index}
                        className="px-5 py-3 rounded-full border text-sm"
                        style={{
                          fontSize: `${Math.max(0.75, Math.min(1.25, 0.75 + keyword.count / 100))}rem`,
                          opacity: 0.7 + keyword.count / 200,
                        }}
                      >
                        {keyword.word}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({keyword.count})
                        </span>
                      </div>
                    ))}
                  </div> */}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Comment Analysis Report
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
