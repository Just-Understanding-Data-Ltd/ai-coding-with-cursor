"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const data = [
  {
    name: "Mon",
    desktop: 590,
    mobile: 800,
    tablet: 481,
  },
  {
    name: "Tue",
    desktop: 732,
    mobile: 901,
    tablet: 534,
  },
  {
    name: "Wed",
    desktop: 820,
    mobile: 908,
    tablet: 590,
  },
  {
    name: "Thu",
    desktop: 934,
    mobile: 1290,
    tablet: 630,
  },
  {
    name: "Fri",
    desktop: 1290,
    mobile: 1200,
    tablet: 700,
  },
  {
    name: "Sat",
    desktop: 590,
    mobile: 790,
    tablet: 390,
  },
  {
    name: "Sun",
    desktop: 690,
    mobile: 990,
    tablet: 490,
  },
];

export function PerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Performance</CardTitle>
        <CardDescription>User engagement by device type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="text-sm font-bold">{label}</div>
                        {payload.map((entry, index) => (
                          <div
                            key={`item-${index}`}
                            className="flex items-center gap-2 text-xs"
                          >
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground capitalize">
                              {entry.name}:
                            </span>
                            <span className="font-medium">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="desktop"
                fill="#8b5cf6"
                name="Desktop"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="mobile"
                fill="#06b6d4"
                name="Mobile"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="tablet"
                fill="#f97316"
                name="Tablet"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
