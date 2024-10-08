import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { config } from "@/config";
import { PainPointsSection } from "@/config";

export default function StripePainPointsSection({
  title,
  withoutProduct,
  withProduct,
}: PainPointsSection) {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800 w-full">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-300">
                Without {config.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-red-600 dark:text-red-200">
              {withoutProduct.points.map((point, index) => (
                <p key={index}>✗ {point}</p>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-300">
                With {config.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-green-600 dark:text-green-200">
              {withProduct.points.map((point, index) => (
                <p key={index}>✓ {point}</p>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
