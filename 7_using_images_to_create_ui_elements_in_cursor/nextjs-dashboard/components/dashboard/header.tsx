"use client";

import { Search, Bell, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/dashboard/sidebar";

export function Header() {
  return (
    <header className="flex h-16 items-center border-b px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="mr-4 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex gap-4 md:gap-8 items-center">
        <form className="hidden md:flex relative">
          <Input type="search" placeholder="Search..." className="w-64 pl-8" />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </form>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search className="h-5 w-5 md:hidden" />
          <Bell className="h-5 w-5 hidden md:block" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
        <Avatar>
          <AvatarImage src="/avatar.png" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
