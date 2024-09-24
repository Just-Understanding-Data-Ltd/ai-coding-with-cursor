import { Button } from "@/components/ui/button";
import { LayoutDashboard, BarChart, Users, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-64 bg-background p-4 border-r border-border">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Dashboard</h2>
      <nav className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-foreground"
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Overview
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-foreground"
        >
          <BarChart className="mr-2 h-4 w-4" />
          Analytics
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-foreground"
        >
          <Users className="mr-2 h-4 w-4" />
          Customers
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-foreground"
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </nav>
    </div>
  );
}
