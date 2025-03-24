"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, Plus, X, Hash, Sparkles } from "lucide-react";
import { ContentStrategyData, Hashtag } from "../types";
import { Progress } from "@/components/ui/progress";

interface ContentStrategyWizardProps {
  onComplete: (data: ContentStrategyData) => void;
}

// Mock data generator functions
const generateMockHashtags = (businessDescription: string): Hashtag[] => {
  // In a real app, this would call an API to get relevant hashtags
  const baseTags = [
    { tag: "#skincare", popularity: 95, relevance: 90 },
    { tag: "#beauty", popularity: 92, relevance: 85 },
    { tag: "#skinhealth", popularity: 88, relevance: 80 },
  ];

  // Generate some business-specific tags based on the description
  const words = businessDescription.toLowerCase().split(/\s+/);
  const businessTags = words
    .filter((word) => word.length > 3)
    .slice(0, 3)
    .map((word, index) => ({
      tag: `#${word}`,
      popularity: Math.floor(Math.random() * 40) + 60,
      relevance: Math.floor(Math.random() * 20) + 80,
    }));

  // Ensure no duplicate tags
  const uniqueTags = [...baseTags];
  businessTags.forEach((tag) => {
    if (!uniqueTags.some((existingTag) => existingTag.tag === tag.tag)) {
      uniqueTags.push(tag);
    }
  });

  return uniqueTags;
};

const generateMockContentStrategyData = (
  businessDescription: string,
  selectedHashtags: Hashtag[]
): ContentStrategyData => {
  // This would be replaced with actual API calls in a real implementation
  return {
    businessDescription,
    selectedHashtags,
    totalVideosAnalyzed: 1287,
    contentThemes: [
      {
        id: "1",
        name: "Product Demonstrations",
        performance: 87,
        videoCount: 342,
        averageEngagement: 12.3,
        topHashtags: ["#tutorial", "#howto", "#demo"],
      },
      {
        id: "2",
        name: "Behind the Scenes",
        performance: 76,
        videoCount: 215,
        averageEngagement: 9.7,
        topHashtags: ["#behindthescenes", "#bts", "#dayinthelife"],
      },
      {
        id: "3",
        name: "Customer Testimonials",
        performance: 92,
        videoCount: 178,
        averageEngagement: 14.5,
        topHashtags: ["#review", "#testimonial", "#customerexperience"],
      },
    ],
    contentFormats: [
      {
        id: "1",
        name: "Tutorial Videos",
        performance: 89,
        videoCount: 412,
        averageEngagement: 13.2,
        description:
          "Step-by-step guides showing how to use products or services",
      },
      {
        id: "2",
        name: "Before & After",
        performance: 94,
        videoCount: 267,
        averageEngagement: 15.8,
        description: "Showcasing transformations and results",
      },
      {
        id: "3",
        name: "Day in the Life",
        performance: 81,
        videoCount: 193,
        averageEngagement: 10.5,
        description: "Following daily routines and activities",
      },
    ],
    contentIdeas: [
      {
        id: "1",
        title: "5-Minute Product Demo",
        description:
          "Quick overview of main features with real-world applications",
        suggestedHashtags: ["#tutorial", "#quicktips", "#howto"],
        estimatedPerformance: 88,
        basedOnVideos: ["v1", "v2", "v3"],
        format: "Tutorial Videos",
      },
      {
        id: "2",
        title: "Customer Success Story",
        description:
          "Interview with a satisfied customer about their experience",
        suggestedHashtags: ["#testimonial", "#success", "#results"],
        estimatedPerformance: 91,
        basedOnVideos: ["v4", "v5"],
        format: "Customer Testimonials",
      },
      {
        id: "3",
        title: "Behind the Scenes Tour",
        description: "Show your workspace and introduce team members",
        suggestedHashtags: ["#behindthescenes", "#meettheteam", "#office"],
        estimatedPerformance: 79,
        basedOnVideos: ["v6", "v7"],
        format: "Behind the Scenes",
      },
    ],
    topVideos: Array(20)
      .fill(0)
      .map((_, i) => {
        const skincareTitles = [
          "My 10-Step Korean Skincare Routine | Morning Edition",
          "The Ordinary Niacinamide Review: 2 Month Results",
          "How to Layer Your Skincare Products CORRECTLY",
          "Cerave vs Cetaphil: Which is Better for Dry Skin?",
          "SKINCARE ROUTINE for ACNE-PRONE Skin (with Before & After)",
          "Hyaluronic Acid Serum: Benefits & How to Use",
          "The TRUTH About Retinol | Dermatologist Explains",
          "Affordable Skincare Haul Under $15 per Product",
          "Dealing with Hormonal Acne: My Journey",
          "Double Cleansing Method: Step by Step Tutorial",
          "Vitamin C Serum: What You Need to Know",
          "Night Skincare Routine for Anti-Aging",
          "Skincare Ingredients You Should NEVER Mix",
          "How I Cleared My Cystic Acne in 30 Days",
          "Drugstore Dupes for High-End Skincare",
          "SPF 101: How to Choose the Right Sunscreen",
          "AHA vs BHA Exfoliants: Which Should You Use?",
          "Get Ready With Me: Winter Skincare Edition",
          "The Best Moisturizers for Sensitive Skin",
          "My Dermatologist's Skincare Recommendations",
        ];

        return {
          id: `v${i + 1}`,
          title: skincareTitles[i],
          platform: i % 2 === 0 ? "TikTok" : "Instagram",
          url: `https://example.com/video${i + 1}`,
          thumbnailUrl: `https://picsum.photos/seed/${i + 1}/300/200`,
          likes: Math.floor(Math.random() * 50000) + 1000,
          shares: Math.floor(Math.random() * 10000) + 100,
          comments: Math.floor(Math.random() * 5000) + 50,
          views: Math.floor(Math.random() * 500000) + 10000,
          likeToShareRatio: Math.random() * 5 + 1,
          likeToCommentRatio: Math.random() * 10 + 1,
          engagement: Math.random() * 20 + 5,
          publishedAt: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 86400000
          ).toISOString(),
          duration: Math.floor(Math.random() * 60) + 15,
          hashtags: selectedHashtags
            .slice(0, Math.floor(Math.random() * 3) + 1)
            .map((h) => h.tag),
          categories: ["Beauty", "Skincare", "Lifestyle"].slice(
            0,
            Math.floor(Math.random() * 3) + 1
          ),
        };
      }),
    autoGeneratedContent: Array(5)
      .fill(0)
      .map((_, i) => {
        const skincareTitles = [
          "10-Minute Skin Glow Routine for Busy Mornings",
          "Clearing Hormonal Acne: A Science-Based Approach",
          "Retinol 101: Transform Your Anti-Aging Routine",
          "Budget Skincare that Actually Works: Under $15",
          "Sensitive Skin Guide: Products that Won't Irritate",
        ];

        const skincareDescriptions = [
          "This AI-generated tutorial combines the most effective quick morning routines for maximum glow with minimal effort.",
          "Based on trending acne treatments, this video covers the science of hormonal acne and evidence-based solutions.",
          "Everything you need to know about retinol in one comprehensive guide, based on popular skincare science content.",
          "Curated affordable skincare recommendations based on ingredient analysis and user reviews across platforms.",
          "A gentle skincare routine compilation featuring products specifically formulated for sensitive and reactive skin types.",
        ];

        return {
          id: `ag${i + 1}`,
          title: skincareTitles[i],
          description: skincareDescriptions[i],
          videoUrl: `https://example.com/auto-video${i + 1}`,
          thumbnailUrl: `https://picsum.photos/seed/auto${i + 1}/300/200`,
          duration: Math.floor(Math.random() * 30) + 15,
          suggestedHashtags: selectedHashtags
            .slice(0, Math.floor(Math.random() * 3) + 1)
            .map((h) => h.tag),
        };
      }),
    scrapingStatus: {
      completed: true,
      progress: 100,
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date().toISOString(),
    },
  };
};

export function ContentStrategyWizard({
  onComplete,
}: ContentStrategyWizardProps) {
  const [step, setStep] = useState<"description" | "hashtags" | "processing">(
    "description"
  );
  const [businessDescription, setBusinessDescription] = useState("");
  const [suggestedHashtags, setSuggestedHashtags] = useState<Hashtag[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<Hashtag[]>([]);
  const [customHashtag, setCustomHashtag] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleDescriptionSubmit = async () => {
    if (!businessDescription.trim()) return;

    setIsGenerating(true);

    // Simulate API call delay
    setTimeout(() => {
      const hashtags = generateMockHashtags(businessDescription);
      setSuggestedHashtags(hashtags);
      setSelectedHashtags(hashtags.slice(0, 3)); // Auto-select top 3
      setIsGenerating(false);
      setStep("hashtags");
    }, 1500);
  };

  const toggleHashtag = (hashtag: Hashtag) => {
    if (selectedHashtags.some((h) => h.tag === hashtag.tag)) {
      setSelectedHashtags(
        selectedHashtags.filter((h) => h.tag !== hashtag.tag)
      );
    } else {
      setSelectedHashtags([...selectedHashtags, hashtag]);
    }
  };

  const addCustomHashtag = () => {
    if (!customHashtag.trim()) return;

    const newTag = customHashtag.startsWith("#")
      ? customHashtag
      : `#${customHashtag}`;

    if (!selectedHashtags.some((h) => h.tag === newTag)) {
      const newHashtag: Hashtag = {
        tag: newTag,
        popularity: 50, // Default values for custom hashtags
        relevance: 75,
      };

      setSelectedHashtags([...selectedHashtags, newHashtag]);
    }

    setCustomHashtag("");
  };

  const startProcessing = () => {
    setStep("processing");

    // Simulate processing with progress updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Generate mock data and complete
        const data = generateMockContentStrategyData(
          businessDescription,
          selectedHashtags
        );
        setTimeout(() => onComplete(data), 500);
      }
      setProcessingProgress(progress);
    }, 500);
  };

  // Calculate a consistent video count that increases with progress
  const calculateVideoCount = (progress: number) => {
    // Target final count around 1287 (the number in the generated data)
    const maxVideos = 1287;
    return Math.round((progress / 100) * maxVideos);
  };

  return (
    <div className="w-full my-12 max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {step === "description" && (
          <motion.div
            key="description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-3 text-center">
              <h3 className="text-2xl font-semibold">Business Profile</h3>
              <div className="text-muted-foreground max-w-md mx-auto">
                Provide details about your business to help our AI generate
                targeted content strategies.
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </span>
                    Business Description
                  </h4>
                  <Textarea
                    placeholder="Describe your products, services, target audience, and unique value proposition..."
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Example: "We create premium organic skincare products for
                    sensitive skin types, focusing on sustainable ingredients
                    and eco-friendly packaging. Our target audience is
                    health-conscious consumers aged 25-45 who prioritize natural
                    ingredients and environmental responsibility."
                  </p>
                </div>

                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">
                      <Hash className="h-4 w-4 text-primary" />
                    </span>
                    Industry Category
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Beauty & Skincare",
                      "Fashion",
                      "Health & Wellness",
                      "Food & Beverage",
                      "Technology",
                      "Home & Lifestyle",
                    ].map((category) => (
                      <Button
                        key={category}
                        variant="outline"
                        className={`justify-start h-auto py-2 px-3 ${
                          businessDescription.includes(
                            `The category of the business is: ${category}`
                          )
                            ? "bg-primary/10 border-primary"
                            : ""
                        }`}
                        type="button"
                        onClick={() => {
                          // Remove any existing category statement
                          let updatedDescription = businessDescription
                            .replace(
                              /The category of the business is: [^.]*\.?/g,
                              ""
                            )
                            .trim();

                          // Add the new category statement if it's not already being removed
                          if (
                            !businessDescription.includes(
                              `The category of the business is: ${category}`
                            )
                          ) {
                            updatedDescription = updatedDescription
                              ? `${updatedDescription}. The category of the business is: ${category}.`
                              : `The category of the business is: ${category}.`;
                          }

                          setBusinessDescription(updatedDescription);
                        }}
                      >
                        {category}
                      </Button>
                    ))}
                    <div className="col-span-2 mt-2">
                      <Input
                        placeholder="Other industry category..."
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            e.currentTarget.value.trim()
                          ) {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();

                            // Remove any existing category statement
                            let updatedDescription = businessDescription
                              .replace(
                                /The category of the business is: [^.]*\.?/g,
                                ""
                              )
                              .trim();

                            // Add the new category statement
                            updatedDescription = updatedDescription
                              ? `${updatedDescription}. The category of the business is: ${value}.`
                              : `The category of the business is: ${value}.`;

                            setBusinessDescription(updatedDescription);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                onClick={handleDescriptionSubmit}
                disabled={!businessDescription.trim() || isGenerating}
                className="px-8"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Business Profile
                  </>
                ) : (
                  <>
                    Continue to Hashtag Selection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === "hashtags" && (
          <motion.div
            key="hashtags"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                Select hashtags for content research
              </h3>
              <p className="text-sm text-muted-foreground">
                These hashtags will be used to find and analyze relevant content
                on TikTok and Instagram.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedHashtags.map((hashtag) => (
                  <Badge
                    key={hashtag.tag}
                    variant="secondary"
                    className="px-3 py-1 text-sm flex items-center gap-1 bg-primary/10 hover:bg-primary/20"
                  >
                    <Hash className="h-3 w-3" />
                    {hashtag.tag.replace("#", "")}
                    <button
                      onClick={() => toggleHashtag(hashtag)}
                      className="ml-1 rounded-full hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Add custom hashtag"
                    value={customHashtag}
                    onChange={(e) => setCustomHashtag(e.target.value)}
                    className="pl-9"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomHashtag();
                      }
                    }}
                  />
                </div>
                <Button variant="outline" onClick={addCustomHashtag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Suggested hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedHashtags.map((hashtag) => (
                    <Badge
                      key={hashtag.tag}
                      variant={
                        selectedHashtags.some((h) => h.tag === hashtag.tag)
                          ? "default"
                          : "outline"
                      }
                      className="px-3 py-1 text-sm cursor-pointer"
                      onClick={() => toggleHashtag(hashtag)}
                    >
                      {hashtag.tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("description")}>
                Back
              </Button>
              <Button
                onClick={startProcessing}
                disabled={selectedHashtags.length === 0}
              >
                Start Analysis
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 py-8"
          >
            <div className="text-center space-y-2">
              <h3 className="text-xl font-medium">Analyzing content</h3>
              <div className="text-muted-foreground">
                We're scraping and analyzing thousands of videos from TikTok and
                Instagram...
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} className="h-2" />
            </div>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mb-2"
                >
                  <Loader2 className="h-4 w-4" />
                </motion.div>
                <span className="text-center">
                  {processingProgress < 30 &&
                    "Scraping videos with selected hashtags..."}
                  {processingProgress >= 30 &&
                    processingProgress < 60 &&
                    "Analyzing engagement metrics..."}
                  {processingProgress >= 60 &&
                    processingProgress < 90 &&
                    "Identifying top-performing content themes..."}
                  {processingProgress >= 90 &&
                    "Generating content recommendations..."}
                </span>
              </div>
              <div className="text-center">
                {processingProgress < 50
                  ? `Found ${calculateVideoCount(processingProgress)} videos so far...`
                  : `Analyzed ${calculateVideoCount(processingProgress)} videos so far...`}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
