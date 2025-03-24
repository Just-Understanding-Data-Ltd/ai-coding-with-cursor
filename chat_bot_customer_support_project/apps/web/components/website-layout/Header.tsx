"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { config } from "@/config";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import Image from "next/image";
import Icon from "@/app/icon.png";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DynamicIcon = dynamic(() => import("./DynamicIcon"), { ssr: false });

interface HeaderProps {
  hidePricing?: boolean;
  hideFAQ?: boolean;
}

export default function Header({
  hidePricing = false,
  hideFAQ = true,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white dark:bg-gray-800 transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Image src={Icon} alt="Icon" width={24} height={24} priority={true} />
          <Link
            href="/"
            className="font-bold text-xl text-gray-900 dark:text-white"
          >
            {config.name}
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden md:inline-flex"
            data-testid="theme-toggle"
          >
            <DynamicIcon icon={theme === "dark" ? "sun" : "moon"} />
          </Button>
          <nav className="hidden md:flex space-x-4">
            {!hidePricing && (
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white cursor-pointer"
              >
                Pricing
              </button>
            )}
            {!hideFAQ && (
              <button
                onClick={() => scrollToSection("faq")}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white cursor-pointer"
              >
                FAQ
              </button>
            )}
            <Button asChild className="w-full">
              <Link href="/login">Login</Link>
            </Button>
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white dark:bg-gray-800 overflow-hidden"
          >
            <nav className="flex flex-col space-y-4 items-center py-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="mb-2"
                data-testid="theme-toggle-mobile"
              >
                <DynamicIcon icon={theme === "dark" ? "sun" : "moon"} />
              </Button>
              {!hidePricing && (
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white cursor-pointer"
                >
                  Pricing
                </button>
              )}
              {!hideFAQ && (
                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white cursor-pointer"
                >
                  FAQ
                </button>
              )}
              <div className="w-full max-w-xs">
                <Button
                  asChild
                  className="w-full bg-green-500 text-white hover:bg-green-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-300"
                >
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
