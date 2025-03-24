import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { config } from "@/config";
import { PainPointsSection } from "@/types/config";
import { XCircle, CheckCircle } from "lucide-react";

export default function StripePainPointsSection({
  title,
  withoutProduct,
  withProduct,
}: PainPointsSection) {
  return (
    <section
      className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 w-full"
      data-testid="pain-points-section"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          {title}
        </h2>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 text-center mb-16 max-w-3xl mx-auto">
          Stop wasting time on tedious social media tasks and focus on what
          really matters
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
            <div className="bg-red-50 dark:bg-red-900/30 p-6">
              <div className="flex items-center mb-4">
                <XCircle className="h-8 w-8 text-red-500 dark:text-red-400 mr-3" />
                <h3 className="text-2xl font-bold text-red-700 dark:text-red-400">
                  Without {config.name}
                </h3>
              </div>
              <p className="text-red-700/70 dark:text-red-400/70 font-medium">
                The old way of managing social media
              </p>
            </div>
            <div className="p-6 space-y-4">
              {withoutProduct.points.map((point, index) => (
                <div key={index} className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 dark:text-gray-300">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
            <div className="bg-green-50 dark:bg-green-900/30 p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500 dark:text-green-400 mr-3" />
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
                  With {config.name}
                </h3>
              </div>
              <p className="text-green-700/70 dark:text-green-400/70 font-medium">
                The smart way to manage social media
              </p>
            </div>
            <div className="p-6 space-y-4">
              {withProduct.points.map((point, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 dark:text-gray-300">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
