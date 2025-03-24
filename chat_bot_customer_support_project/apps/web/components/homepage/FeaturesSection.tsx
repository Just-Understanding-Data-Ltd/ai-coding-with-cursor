"use client";

import { useState } from "react";
import { FeaturesSection as FeaturesSectionType } from "@/types/config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function FeaturesSection({
  title,
  description,
  useTabLayout = true,
  features,
}: FeaturesSectionType) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(features[0].title);

  return (
    <section
      className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden"
      data-testid="features-section"
    >
      <div className="container mx-auto px-4 max-w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-300">
            {title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
            {description}
          </p>
        </div>

        <Tabs
          defaultValue={features[0].title}
          className="w-full max-w-6xl mx-auto"
        >
          <div className="flex justify-center mb-12 px-4 md:px-0 overflow-x-auto">
            <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full h-auto flex flex-wrap md:flex-nowrap">
              {features.map((feature, index) => (
                <TabsTrigger
                  key={index}
                  value={feature.title}
                  onClick={() => setActiveTab(feature.title)}
                  className="rounded-full py-2 md:py-3 px-4 md:px-6 text-sm md:text-base data-[state=active]:bg-primary data-[state=active]:text-white text-gray-700 dark:text-gray-300"
                >
                  <feature.icon className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">{feature.title}</span>
                  <span className="sm:hidden">
                    {feature.title.split(" ")[0]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {features.map((feature, index) => (
            <TabsContent key={index} value={feature.title} className="mt-0">
              <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="order-2 md:order-1"
                >
                  <div className="bg-gray-50 dark:bg-gray-800 p-1 rounded-2xl shadow-xl">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={800}
                        height={450}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="order-1 md:order-2 px-4 md:px-0 w-full max-w-full overflow-hidden"
                >
                  <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-6">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 break-words">
                    {feature.description}
                  </p>

                  {feature.title === "Unified Social Inbox" && (
                    <ul className="space-y-3 text-sm md:text-base">
                      <li className="flex items-start">
                        <span className="text-primary mr-2 flex-shrink-0">
                          •
                        </span>
                        <span className="break-words">
                          Manage comments and messages from Facebook, Instagram,
                          and TikTok
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 flex-shrink-0">
                          •
                        </span>
                        <span className="break-words">
                          Filter by platform, sentiment, status, and more
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 flex-shrink-0">
                          •
                        </span>
                        <span className="break-words">
                          Never miss important interactions with priority alerts
                        </span>
                      </li>
                    </ul>
                  )}

                  {feature.title === "AI Comment Management" && (
                    <ul className="space-y-3 text-sm md:text-base">
                      <li className="flex items-start">
                        <span className="text-primary mr-2 flex-shrink-0">
                          •
                        </span>
                        <span className="break-words">
                          Automatically respond to common questions and comments
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 flex-shrink-0">
                          •
                        </span>
                        <span className="break-words">
                          Filter out spam and negative comments with smart
                          moderation
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 flex-shrink-0">
                          •
                        </span>
                        <span className="break-words">
                          Train AI to match your brand voice and messaging
                        </span>
                      </li>
                    </ul>
                  )}

                  {feature.title === "Video Content Analysis" && (
                    <ul className="space-y-3 text-sm md:text-base">
                      <li className="flex items-start">
                        <span className="text-primary mr-2 flex-shrink-0">
                          •
                        </span>
                        <span className="break-words">
                          Download and analyze 500+ competitor videos
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 flex-shrink-0">
                          •
                        </span>
                        <span className="break-words">
                          Identify trends, formats, and engagement patterns
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 flex-shrink-0">
                          •
                        </span>
                        <span className="break-words">
                          Generate data-driven content strategy recommendations
                        </span>
                      </li>
                    </ul>
                  )}

                  {feature.title === "Team Collaboration" && (
                    <ul className="space-y-3 text-sm md:text-base">
                      <li className="flex items-start">
                        <span className="text-primary mr-2 flex-shrink-0">
                          •
                        </span>
                        <span className="break-words">
                          Invite team members and clients with customizable
                          permissions
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 flex-shrink-0">
                          •
                        </span>
                        <span className="break-words">
                          Assign comments and messages to specific team members
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 flex-shrink-0">
                          •
                        </span>
                        <span className="break-words">
                          Track team performance with detailed analytics
                        </span>
                      </li>
                    </ul>
                  )}
                </motion.div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 rounded-full px-4 md:px-6 py-2 md:py-3 mb-4 md:mb-6">
            <span className="text-blue-600 dark:text-blue-400 text-sm md:text-base font-medium">
              Ready to see these features in action?
            </span>
          </div>
          <div>
            <Button
              onClick={() => router.push("/login")}
              className="bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/90 transition-colors duration-300 shadow-lg hover:shadow-xl font-semibold px-6 md:px-8 py-2 h-12 md:h-14 text-lg md:text-xl rounded-lg"
            >
              Log in to dashboard
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
