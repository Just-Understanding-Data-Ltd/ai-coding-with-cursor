import Link from "next/link";
import { config } from "@/config";

export default function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <p>
            &copy; {new Date().getFullYear()} {config.name}. All rights
            reserved.
          </p>
          <nav className="space-x-4">
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
