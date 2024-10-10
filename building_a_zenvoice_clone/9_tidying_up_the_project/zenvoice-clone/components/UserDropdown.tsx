"use client";

import { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, CreditCard, Sun, Moon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { createBillingPortalSession } from "@/app/actions/stripe";
import { useTheme } from "next-themes";

interface UserDropdownProps {
  user: User;
}

export function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleManageBilling = async () => {
    try {
      const url = await createBillingPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating billing portal session:", error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="cursor-pointer bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {user.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
        <DropdownMenuItem
          onClick={handleManageBilling}
          className="cursor-pointer text-gray-900 dark:text-white"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Manage Billing
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={toggleTheme}
          className="cursor-pointer text-gray-900 dark:text-white"
        >
          {theme === "dark" ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          Toggle Theme
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-gray-900 dark:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
