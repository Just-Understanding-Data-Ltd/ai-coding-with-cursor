import { createClient } from "@supabase/supabase-js";
import { Database } from "@repo/supabase";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getArticles(
  limit = 10,
  authorId?: string,
  categoryId?: string
) {
  let query = supabase
    .from("articles")
    .select(
      `
      *,
      authors (
        id,
        name
      ),
      categories (
        id,
        name
      )
    `
    )
    .order("published_at", { ascending: false })
    .limit(limit);

  if (authorId) {
    query = query.eq("author_id", authorId);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) throw error;
  return data;
}

export async function getArticlesByCategoryId(categoryId: string) {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("category_id", categoryId);

  if (error) throw error;
  return data;
}

export async function getArticleById(id: string | undefined) {
  if (!id) return null;
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      categories (
        id,
        name
      ),
      authors (
        id,
        name,
        bio,
        avatar_url
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Record not found
    throw error;
  }
  return data;
}

export async function getAuthorById(id: string | undefined) {
  if (!id) return null;
  const { data, error } = await supabase
    .from("authors")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Record not found
    throw error;
  }
  return data;
}

export async function getCategoryById(id: string | undefined) {
  if (!id) return null;
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Record not found
    throw error;
  }
  return data;
}
