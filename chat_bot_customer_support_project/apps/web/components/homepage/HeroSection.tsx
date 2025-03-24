"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { config } from "@/config";
import { Inbox, Video } from "lucide-react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  poweredByStripeImage?: string;
  ctaLink: string;
  ctaText: string;
  ctaClassName?: string;
}

export default function HeroSection({
  title,
  subtitle,
  poweredByStripeImage,
  ctaLink,
  ctaText,
  ctaClassName,
}: HeroSectionProps) {
  const router = useRouter();

  return (
    <section
      className="py-16 bg-gradient-to-br from-indigo-900 to-blue-950 text-white md:min-h-screen md:flex md:items-center md:justify-center relative overflow-hidden"
      data-testid="hero-section"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-indigo-400 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="px-4 mx-auto max-w-screen-xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-blue-800/40 backdrop-blur-sm border border-blue-700">
            <span className="text-yellow-400 mr-2">✨</span>
            <span className="text-sm font-medium">
              Now supporting Facebook, Instagram & TikTok
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-8 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl"
        >
          {title ? (
            <>
              <span className="block mb-2 sm:mb-0">
                {title.split(" Made Effortless")[0]}
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                Made Effortless
              </span>
            </>
          ) : (
            <>
              <span className="block mb-2 sm:mb-0">
                Social Media Management
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                Made Effortless
              </span>
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-12 text-lg font-normal text-gray-200 lg:text-xl sm:px-16 xl:px-24 max-w-5xl mx-auto"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center mb-16"
        >
          <Button
            className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 text-white transition-all duration-300 shadow-lg hover:shadow-indigo-500/40 font-semibold w-64 h-14 text-xl rounded-lg border border-indigo-400/50 hover:scale-105 group"
            onClick={() => router.push(ctaLink)}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            <span className="relative z-10 inline-flex items-center">
              {ctaText}
              <svg
                className="w-5 h-5 ml-2 -mr-1 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                ></path>
              </svg>
            </span>
          </Button>
        </motion.div>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 flex flex-col items-center text-center hover:bg-white/15 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <div className="inline-flex items-center justify-center p-4 bg-indigo-700/60 rounded-lg mb-5 shadow-lg">
              <Inbox className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI-Powered Social Inbox</h3>
            <p className="text-gray-200">
              Manage all your comments and messages across platforms with
              intelligent AI responses and moderation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}
            className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 flex flex-col items-center text-center hover:bg-white/15 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <div className="inline-flex items-center justify-center p-4 bg-indigo-700/60 rounded-lg mb-5 shadow-lg">
              <Video className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Video Content Analysis</h3>
            <p className="text-gray-200">
              Generate data-driven content strategies by analyzing 500+
              competitor videos for each client.
            </p>
          </motion.div>
        </div>

        {/* User Ratings Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.2 }}
          className="mt-20 flex items-center justify-center"
        >
          <div className="flex items-center bg-white/10 backdrop-blur-sm px-8 py-5 rounded-full shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="flex -space-x-4 mr-5">
              {[1, 2, 3].map((id) => (
                <div
                  key={id}
                  className="w-12 h-12 relative overflow-hidden rounded-full border-2 border-indigo-600 shadow-md"
                >
                  <Image
                    src={`/testimonials/${id}.jpg`}
                    alt={`User ${id}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="text-yellow-400 text-2xl">★★★★★</div>
              <div className="text-lg font-semibold">
                Trusted by {config.homepage.numberOfMakersShipped}+ teams
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
