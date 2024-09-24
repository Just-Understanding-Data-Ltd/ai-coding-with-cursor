import { ThemeToggle } from "@/components/ThemeToggle";

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-16 items-center px-4">
        <h1 className="text-2xl font-bold text-foreground">
          Analytics Dashboard
        </h1>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
