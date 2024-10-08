import HeroSection from "./HeroSection";
import InvoiceRequestToast from "../invoices/InvoiceRequestToast";
import USPSection from "./USPSection";
import TestimonialSection from "./TestimonialSection";
import FAQSection from "./FAQSection";
import PainPointsSection from "../dashboard/StripePainPointsSection";
import { PlanSelector } from "../PlanSelector";
import { config } from "@/config";

export default function HomePage() {
  return (
    <>
      <HeroSection
        title={config.homepage.heroTitle}
        subtitle={config.homepage.heroSubtitle}
      />
      <PainPointsSection {...config.homepage.painPointsSection} />
      <USPSection usps={config.homepage.usps} />
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">
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
