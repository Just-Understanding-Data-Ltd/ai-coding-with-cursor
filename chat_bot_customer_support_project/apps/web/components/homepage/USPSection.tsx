"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Shield,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface USPProps {
  usps: Array<{
    title: string;
    description: string;
    icon: any;
  }>;
}

export default function USPSection({ usps }: USPProps) {
  const router = useRouter();

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
      },
    }),
  };

  const reasons = [
    {
      icon: BarChart3,
      title: "Data-Driven Insights",
      description:
        "Analyze 500+ videos from competitors to extract actionable content strategies unique to your brand.",
      color: "bg-blue-500",
    },
    {
      icon: Zap,
      title: "AI-Powered Efficiency",
      description:
        "Automate comment moderation and responses with AI that understands your brand voice and messaging.",
      color: "bg-purple-500",
    },
    {
      icon: Target,
      title: "Multi-Platform Support",
      description:
        "Manage Facebook, Instagram, and TikTok from one unified inbox designed for modern social teams.",
      color: "bg-pink-500",
    },
    {
      icon: Clock,
      title: "Time-Saving Workflow",
      description:
        "Reduce hours spent on monitoring comments and analyzing competitor content with smart automation.",
      color: "bg-green-500",
    },
    {
      icon: Shield,
      title: "Brand Protection",
      description:
        "Intelligent moderation keeps your social presence clean and professional, protecting your reputation.",
      color: "bg-yellow-500",
    },
    {
      icon: TrendingUp,
      title: "Scalable Team Collaboration",
      description:
        "Seamlessly work with internal teams and clients through custom workspaces and permission controls.",
      color: "bg-orange-500",
    },
  ];

  return (
    <section
      className="py-24 bg-white dark:bg-gray-900"
      data-testid="usp-section"
    >
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose OctoSpark?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            The most complete solution for managing social media content and
            engagement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUp}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-1">
                <div className={`${reason.color} h-2 rounded-t-xl`}></div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div
                    className={`p-3 rounded-lg ${reason.color} bg-opacity-10 mr-4`}
                  >
                    <reason.icon
                      className={`h-6 w-6 text-${reason.color.split("-")[1]}-500`}
                    />
                  </div>
                  <h3 className="text-xl font-bold">{reason.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
