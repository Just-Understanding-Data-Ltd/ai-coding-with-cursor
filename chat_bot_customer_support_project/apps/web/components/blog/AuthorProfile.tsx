import { Tables } from "@repo/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuthorProfileProps {
  author: Tables<"authors"> | null;
}

export default function AuthorProfile({ author }: AuthorProfileProps) {
  if (!author) {
    return (
      <div className="text-center text-2xl text-muted">Author not found</div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={author.avatar_url || undefined} alt={author.name} />
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl">{author.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {author.bio && <p className="text-muted-foreground">{author.bio}</p>}
      </CardContent>
    </Card>
  );
}
