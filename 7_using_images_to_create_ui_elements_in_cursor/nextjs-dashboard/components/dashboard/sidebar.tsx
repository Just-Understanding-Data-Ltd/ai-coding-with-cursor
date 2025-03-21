"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Package,
  Settings,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    color: "text-violet-500",
  },
  {
    label: "Customers",
    icon: Users,
    href: "/dashboard/customers",
    color: "text-pink-700",
  },
  {
    label: "Products",
    icon: Package,
    href: "/dashboard/products",
    color: "text-orange-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
  {
    label: "Help",
    icon: LifeBuoy,
    href: "/dashboard/help",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex h-full flex-col bg-background border-r">
      <div className="p-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-xl">Acme Inc</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                pathname === route.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <route.icon className={cn("h-5 w-5", route.color)} />
              {route.label}
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="p-3 mt-auto border-t">
        <Button variant="outline" className="w-full justify-start gap-2">
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </Button>
      </div>
    </div>
  );
}
