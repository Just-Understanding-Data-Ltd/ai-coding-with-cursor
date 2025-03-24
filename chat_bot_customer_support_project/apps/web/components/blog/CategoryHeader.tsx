import { Tables } from "@repo/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryHeaderProps {
  category: Tables<"categories"> | null;
}

export default function CategoryHeader({ category }: CategoryHeaderProps) {
  if (!category) {
    return (
      <div className="text-center text-2xl text-muted">Category not found</div>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary to-secondary text-white">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">{category.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {category.description && (
          <p className="text-lg opacity-90">{category.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
