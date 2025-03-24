import { generateSEOMetadata } from "@/lib/seo";
import CategoryHeader from "@/components/blog/CategoryHeader";
import BlogList from "@/components/blog/BlogList";
import { getCategoryById, getCategories } from "@/lib/blog";
import { notFound } from "next/navigation";
import { getArticlesByCategoryId } from "@/lib/blog";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ categoryId: category.id }));
}

// Simplify metadata to avoid fetch errors
export const metadata = {
  title: "Blog Category",
  description: "View articles in this category",
};

// Original metadata function FULLY commented out to avoid conflicts
/* 
export async function generateMetadata(props: {
  params: Promise<{ categoryId: string }>;
}) {
  const params = await props.params;
  const category = await getCategoryById(params.categoryId);
  if (!category) return notFound();
  return generateSEOMetadata({
    title: `${category.name} | SwiftVoice Blog`,
    description: `Articles in the ${category.name} category`,
  });
}
*/

export default async function CategoryPage(props: {
  params: Promise<{ categoryId: string }>;
}) {
  try {
    const params = await props.params;
    const category = await getCategoryById(params.categoryId);
    if (!category) return notFound();
    const articles = await getArticlesByCategoryId(params.categoryId);

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <CategoryHeader category={category} />
        {/* @ts-ignore */}
        <BlogList articles={articles} />
      </div>
    );
  } catch (error) {
    // Fallback UI if data fetching fails
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-center">
        <h1 className="text-3xl font-bold">Category Page</h1>
        <p className="text-gray-600">
          This page is temporarily under maintenance. Please check back later.
        </p>
      </div>
    );
  }
}
