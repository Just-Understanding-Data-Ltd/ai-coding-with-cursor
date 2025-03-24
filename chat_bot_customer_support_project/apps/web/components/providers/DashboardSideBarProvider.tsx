"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/dashboard/MainSidebar";
import { ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import React from "react";
import { Menu } from "lucide-react";
import { getMemberRoles } from "@/features/authorization/actions/get-member-roles";

interface DashboardSideBarProps {
  children: ReactNode;
  orgId: string;
  role: Awaited<ReturnType<typeof getMemberRoles>>;
  user: User;
}

function SidebarContent({ children }: { children: ReactNode }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Mobile Trigger */}
      <SidebarTrigger className="fixed top-4 left-4 z-50 md:hidden">
        <Menu className="h-6 w-6" />
      </SidebarTrigger>

      {/* Desktop Trigger - positioned relative to sidebar state */}
      <SidebarTrigger
        className="fixed top-2 z-50 hidden md:flex transition-all duration-300"
        style={{
          left: isCollapsed ? "3rem" : "calc(var(--sidebar-width) - 2rem)",
        }}
      >
        <Menu className="h-6 w-6" />
      </SidebarTrigger>

      <div className="pt-4">{children}</div>
    </main>
  );
}

export default function DashboardSideBar({
  children,
  orgId,
  role,
  user,
}: DashboardSideBarProps) {
  // Determine which sidebar to show based on the current path
  const getCurrentSidebar = () => {
    return (
      <MainSidebar user={user} currentOrganizationId={orgId} role={role} />
    );
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-mobile": "100%",
        } as React.CSSProperties
      }
    >
      {getCurrentSidebar()}
      <SidebarContent>{children}</SidebarContent>
    </SidebarProvider>
  );
}
