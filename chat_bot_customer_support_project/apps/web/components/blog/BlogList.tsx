"use client";

import { Tables } from "@repo/supabase";
import AnimatedBlogCard from "./AnimatedBlogCard";

interface BlogListProps {
  articles: (Tables<"articles"> & {
    authors: Tables<"authors"> | null;
    categories: Tables<"categories">[] | null;
  })[];
}

export default function BlogList({ articles }: BlogListProps) {
  if (articles.length === 0) {
    return <p className="text-center text-muted">No articles found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {articles.map((article, index) => (
        <AnimatedBlogCard key={article.id} article={article} index={index} />
      ))}
    </div>
  );
}
