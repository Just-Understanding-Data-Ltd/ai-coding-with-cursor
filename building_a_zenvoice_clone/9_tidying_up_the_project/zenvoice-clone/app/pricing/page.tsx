import { PlanSelector } from "@/components/PlanSelector";

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Choose Your Plan</h1>
      <PlanSelector />
    </div>
  );
}
