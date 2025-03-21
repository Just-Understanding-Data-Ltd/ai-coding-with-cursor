import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { TrafficChart } from "@/components/dashboard/traffic-chart";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your business performance and analytics
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewStats />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SalesChart />
            <TrafficChart />
            <PerformanceChart />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <RevenueChart />
            <RecentActivity />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SalesChart />
            <TrafficChart />
            <PerformanceChart />
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-muted-foreground">Reports content coming soon.</p>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Settings content coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
