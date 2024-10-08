import LoginForm from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { config } from "@/config";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="flex items-center justify-between">
          <Link href={"/"}>
            <Button variant="ghost" className="flex items-center gap-2 p-0">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {config.name}
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
