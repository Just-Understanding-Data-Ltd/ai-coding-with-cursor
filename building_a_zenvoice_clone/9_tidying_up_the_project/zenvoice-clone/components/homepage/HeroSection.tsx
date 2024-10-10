"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  poweredByStripeImage?: string;
}

export default function HeroSection({
  title,
  subtitle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  poweredByStripeImage,
}: HeroSectionProps) {
  const router = useRouter();

  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className=" px-4 mx-auto max-w-screen-lg text-center lg:py-16 lg:px-12">
        {/* <div className="flex justify-center mb-2">
          <Image
            src={poweredByStripeImage}
            alt="Powered by Stripe"
            width={200}
            height={50}
            className="h-auto"
          />
        </div> */}
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl">
          {title}
        </h1>

        <p className="mb-8 text-lg font-normal text-gray-300 lg:text-xl sm:px-16 xl:px-48">
          {subtitle}
        </p>
        <Button
          size="lg"
          className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
          onClick={() => router.push("/login")}
        >
          Get Started
        </Button>
      </div>
    </section>
  );
}
