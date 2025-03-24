import { generateSEOMetadata } from "@/lib/seo";
import BlogList from "@/components/blog/BlogList";
import { getBlogConfig } from "@/config";
import { getArticles } from "@/lib/blog";

const blogConfig = getBlogConfig();

export const metadata = generateSEOMetadata({
  title: `${blogConfig.title} | SwiftVoice`,
  description: blogConfig.description,
});

export default async function BlogPage() {
  const articles = await getArticles(10);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{blogConfig.title}</h1>
        <p className="text-lg text-muted-foreground mb-12">
          {blogConfig.description}
        </p>
      </div>
      {/* @ts-ignore */}
      <BlogList articles={articles} />
    </div>
  );
}
