import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface TestimonialProps {
  testimonials: Array<{
    name: string;
    company: string;
    quote: string;
    imageId: number;
  }>;
}

export default function TestimonialSection({ testimonials }: TestimonialProps) {
  const router = useRouter();

  return (
    <section
      className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 w-full"
      data-testid="testimonial-section"
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by Social Media Teams
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            See what our customers have to say about OctoSpark
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={`testimonial-${testimonial.imageId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-grow">
                <div className="mb-4 text-primary">
                  <Quote className="h-8 w-8 transform -scale-x-100" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center mt-auto">
                  <div className="w-12 h-12 mr-4 rounded-full overflow-hidden ring-2 ring-primary/20">
                    <Image
                      src={`/testimonials/${testimonial.imageId}.jpg`}
                      alt={`${testimonial.name}'s avatar`}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-primary/5 dark:bg-primary/10 p-4 flex items-center justify-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="flex flex-col items-center">
            <p className="text-gray-600 dark:text-gray-300 mb-5 max-w-xl mx-auto">
              Join hundreds of social media teams who are already using
              OctoSpark to streamline their workflow
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/90 transition-colors duration-300 shadow-lg hover:shadow-xl font-semibold px-6 md:px-8 py-2 h-12 md:h-14 text-lg md:text-xl rounded-lg"
            >
              Sign in to your account
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
