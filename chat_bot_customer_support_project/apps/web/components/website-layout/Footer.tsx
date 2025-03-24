import Link from "next/link";
import { config } from "@/config";

export default function Footer() {
  return (
    <footer className="border-t py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
          <div className="flex flex-col items-center md:items-start space-y-4 mb-6 md:mb-0"></div>

          <div className="flex flex-col items-center md:items-end space-y-4">
            <nav className="flex flex-wrap justify-center md:justify-end space-x-4 text-sm">
              <Link
                href="/our-terms-of-service"
                className="hover:text-primary transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/our-privacy-policy"
                className="hover:text-primary transition-colors"
              >
                Privacy
              </Link>
            </nav>

            <a
              href="https://cursordevkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-3 py-1 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
            >
              <span className="text-lg">🪄</span>
              <span>Built with CursorDevKit</span>
            </a>

            <p className="text-xs text-center md:text-right text-muted-foreground">
              &copy; {new Date().getFullYear()} {config.name}. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
