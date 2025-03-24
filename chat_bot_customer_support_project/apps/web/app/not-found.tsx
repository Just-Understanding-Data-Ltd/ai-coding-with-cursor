import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import ContactSupportButton from "@/components/buttons/ContactSupportButton";
import Image from "next/image";
export default function NotFound() {
  return (
    <section className="bg-background text-foreground h-screen w-full flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <Image
            src="/404.png"
            alt="404 Not Found"
            width={250}
            height={160}
            className="mx-auto"
          />
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold mb-8">
          This page doesn&apos;t exist
        </h1>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>

          <ContactSupportButton />
        </div>
      </div>
    </section>
  );
}
