"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

interface FAQProps {
  faqs: Array<{ question: string; answer: string }>;
}

export default function FAQSection({ faqs }: FAQProps) {
  return (
    <section
      className="bg-gray-50 dark:bg-gray-900 py-24"
      data-testid="faq-section"
    >
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Everything you need to know about OctoSpark's social media
            management tools
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion
            type="single"
            collapsible
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b last:border-0 border-gray-200 dark:border-gray-700"
              >
                <AccordionTrigger className="text-lg font-medium py-5 px-6 text-left hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-600 dark:text-gray-300 px-6 pb-5 pt-0">
                  <p className="mt-2">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
