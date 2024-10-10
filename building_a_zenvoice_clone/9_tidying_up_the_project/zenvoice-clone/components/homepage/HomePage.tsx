"use client";

import HeroSection from "./HeroSection";
import InvoiceRequestToast from "../invoices/InvoiceRequestToast";
import USPSection from "./USPSection";
import TestimonialSection from "./TestimonialSection";
import FAQSection from "./FAQSection";
import PainPointsSection from "../dashboard/StripePainPointsSection";
import { PlanSelector } from "../PlanSelector";
import { config } from "@/config";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function HomePage() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {theme === "dark" ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
      </div>
      <HeroSection
        title={config.homepage.heroTitle}
        subtitle={config.homepage.heroSubtitle}
        poweredByStripeImage="/powered-by-stripe.png"
      />
      <PainPointsSection {...config.homepage.painPointsSection} />
      <USPSection usps={config.homepage.usps} />
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            Choose Your Plan
          </h2>
          <PlanSelector successUrl="/login" cancelUrl="/" />
        </div>
      </section>
      <InvoiceRequestToast />
      <TestimonialSection testimonials={config.homepage.testimonials} />
      <FAQSection faqs={config.homepage.faqs} />
    </>
  );
}
