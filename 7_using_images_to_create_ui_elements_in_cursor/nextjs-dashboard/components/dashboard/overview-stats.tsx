import {
  ArrowDownIcon,
  ArrowUpIcon,
  Users,
  CreditCard,
  DollarSign,
  Package,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    changeType: "positive",
    description: "You made an extra $45,231 this month",
    icon: DollarSign,
  },
  {
    title: "Subscriptions",
    value: "+2350",
    change: "+180.1%",
    changeType: "positive",
    description: "You gained 2350 new subscribers",
    icon: Users,
  },
  {
    title: "Sales",
    value: "+12,234",
    change: "+19%",
    changeType: "positive",
    description: "You made 12,234 sales this month",
    icon: CreditCard,
  },
  {
    title: "Active Now",
    value: "+573",
    change: "-201",
    changeType: "negative",
    description: "You have 573 users online now",
    icon: Package,
  },
];

export function OverviewStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
          <CardFooter>
            <div
              className={`flex items-center text-xs ${
                stat.changeType === "positive"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {stat.changeType === "positive" ? (
                <ArrowUpIcon className="mr-1 h-4 w-4" />
              ) : (
                <ArrowDownIcon className="mr-1 h-4 w-4" />
              )}
              <span>{stat.change} from last month</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
