"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// A small helper component to display an error/expired state in a neat manner
export default function InvitationErrorPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="p-4 text-center">
            <CardTitle className="text-xl font-bold text-destructive">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2 p-4">
            {description && (
              <p className="text-center text-sm text-muted-foreground">
                {description}
              </p>
            )}
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => (window.location.href = "/")}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
