import { Tables } from "@repo/supabase";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ArticleContentProps {
  article:
    | (Tables<"articles"> & {
        categories: Tables<"categories"> | null;
        authors: Tables<"authors"> | null;
      })
    | null;
}

export default function ArticleContent({ article }: ArticleContentProps) {
  if (!article) {
    return (
      <div className="text-center text-2xl text-muted">Article not found</div>
    );
  }

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
    <Card className="max-w-5xl mx-auto border-0 shadow-none">
      {article.featured_image && (
        <div className="relative w-full h-64 mb-6">
          <Image
            src={article.featured_image}
            alt={article.title}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-lg"
          />
        </div>
      )}
      <CardHeader className="px-0">
        {article.categories && (
          <div className="mb-4">
            <Link href={`/blog/category/${article.categories.id}`}>
              <Badge variant="outline" className="hover:bg-secondary">
                {article.categories.name}
              </Badge>
            </Link>
          </div>
        )}
        <CardTitle className="text-4xl">{article.title}</CardTitle>
        {article.excerpt && (
          <p className="text-lg text-muted-foreground mt-4">
            {article.excerpt}
          </p>
        )}
      </CardHeader>
      <CardContent className="px-0">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        {article.published_at && (
          <p className="text-sm text-muted-foreground mt-8">
            Published on: {formatDate(article.published_at)}
          </p>
        )}
        {article.authors && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">About the Author</h2>
            <div className="flex items-center">
              <Avatar className="h-16 w-16 mr-4">
                <AvatarImage
                  src={article.authors.avatar_url || undefined}
                  alt={article.authors.name}
                />
                <AvatarFallback>
                  {article.authors.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-semibold">{article.authors.name}</p>
                {article.authors.bio && (
                  <p className="text-muted-foreground mt-2">
                    {article.authors.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
