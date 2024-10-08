"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { config } from "@/config";

export default function Header() {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          {config.name}
        </Link>
        <nav className="space-x-4">
          <button
            onClick={() => scrollToSection("pricing")}
            className="hover:text-primary cursor-pointer"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="hover:text-primary cursor-pointer"
          >
            FAQ
          </button>
          <Button asChild>
            <Link href={config.auth.loginUrl}>Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
