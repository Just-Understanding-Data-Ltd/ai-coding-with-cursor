"use client";

import HeroSection from "./HeroSection";
import USPSection from "./USPSection";
import TestimonialSection from "./TestimonialSection";
import FAQSection from "./FAQSection";
import PainPointsSection from "./PaintPointsSection";
import FeaturesSection from "./FeaturesSection";
import { config } from "@/config";
import CTASection from "./CTASection";

export default function HomePage() {
  return (
    <div data-testid="home-page">
      <HeroSection
        title={config.homepage.heroTitle}
        subtitle={config.homepage.heroSubtitle}
        poweredByStripeImage="/powered-by-stripe.svg"
        ctaLink="/login"
        ctaText="Get Started"
        ctaClassName="px-8 py-4"
      />
      <PainPointsSection {...config.homepage.painPointsSection} />
      <USPSection usps={config.homepage.usps} />
      <FeaturesSection {...config.homepage.featuresSection} />
      {/* <section
        id="pricing"
        className="bg-gray-50 dark:bg-gray-900 py-16"
        data-testid="pricing-section"
      >
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white"
            data-testid="pricing-title"
          >
            Choose Your Plan
          </h2>
          <PlanSelector successUrl="/login" cancelUrl="/" />
        </div>
      </section> */}
      <TestimonialSection testimonials={config.homepage.testimonials} />
      <CTASection {...config.homepage.ctaSection} />
      <FAQSection faqs={config.homepage.faqs} />
    </div>
  );
}
