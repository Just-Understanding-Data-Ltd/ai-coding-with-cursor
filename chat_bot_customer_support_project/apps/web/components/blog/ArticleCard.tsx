import Link from "next/link";
import { Article } from "@/types/blog";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <Link
        href={`/blog/${article.id}`}
        className="text-xl font-semibold hover:underline"
      >
        {article.title}
      </Link>
      <p className="text-gray-600 mt-2">{article.excerpt}</p>
      <div className="mt-4 text-sm text-gray-500">
        Published on {new Date(article.publishedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
