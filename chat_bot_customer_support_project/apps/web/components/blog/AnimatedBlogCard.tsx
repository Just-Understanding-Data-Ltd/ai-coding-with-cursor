import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@repo/supabase";
import AnimatedBlogCardWrapper from "./AnimatedBlogCardWrapper";

interface AnimatedBlogCardProps {
  article: Tables<"articles"> & {
    authors: Tables<"authors"> | null;
    categories: Tables<"categories">[] | null;
  };
  index: number;
}

const placeholderImages = [
  "/images/placeholder1.jpg",
  "/images/placeholder2.jpg",
  "/images/placeholder3.jpg",
];

export default function AnimatedBlogCard({
  article,
  index,
}: AnimatedBlogCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AnimatedBlogCardWrapper index={index} href={`/blog/${article.id}`}>
      <Card className="flex flex-col h-full transition-shadow hover:shadow-md">
        <div className="relative w-full h-48">
          <Image
            src={
              article.featured_image ||
              placeholderImages[index % placeholderImages.length]
            }
            alt={article.title}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-t-lg"
          />
        </div>
        <CardHeader className="flex-grow">
          {article.categories && article.categories.length > 0 && (
            <div className="mb-2 space-x-2">
              {article.categories.slice(0, 2).map((category) => (
                <Link
                  key={category.id}
                  href={`/blog/category/${category.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge
                    variant="secondary"
                    className="hover:bg-secondary-hover text-sm py-1 px-2"
                  >
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
          <CardTitle className="line-clamp-2">{article.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-between flex-grow">
          {article.excerpt && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {article.excerpt}
            </p>
          )}
          <div className="flex justify-between items-center text-xs text-muted-foreground mt-auto">
            {article.authors && (
              <span className="hover:underline">By {article.authors.name}</span>
            )}
            {article.published_at && (
              <span>Published on: {formatDate(article.published_at)}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </AnimatedBlogCardWrapper>
  );
}
