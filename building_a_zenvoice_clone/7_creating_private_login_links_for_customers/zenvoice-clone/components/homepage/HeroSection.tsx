"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HeroSection({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const router = useRouter();

  return (
    <section className="bg-gradient-to-r from-gray-950 to-indigo-950 dark:from-black dark:to-indigo-950 py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl mb-6 drop-shadow-lg">
            {title}
          </h1>
          <p className="text-xl text-gray-200 mb-10 sm:text-2xl">{subtitle}</p>
          <Button
            size="lg"
            className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-800 dark:hover:bg-indigo-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
            onClick={() => router.push("/login")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
}
