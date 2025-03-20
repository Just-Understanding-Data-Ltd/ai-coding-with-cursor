import {
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  Users,
  Store,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const activities = [
  {
    icon: CheckCircle2,
    title: "Order #38912 completed",
    description: "Customer received their order",
    time: "2 mins ago",
    iconColor: "text-green-500",
    user: {
      name: "John Smith",
      image: "/avatars/01.png",
      initials: "JS",
    },
  },
  {
    icon: Store,
    title: "New product added",
    description: "Premium headphones added to inventory",
    time: "1 hour ago",
    iconColor: "text-blue-500",
    user: {
      name: "Sarah Johnson",
      image: "/avatars/02.png",
      initials: "SJ",
    },
  },
  {
    icon: ShoppingCart,
    title: "New order #39012 received",
    description: "Customer placed a new order",
    time: "3 hours ago",
    iconColor: "text-purple-500",
    user: {
      name: "Emily Davis",
      image: "/avatars/03.png",
      initials: "ED",
    },
  },
  {
    icon: AlertCircle,
    title: "Low stock alert",
    description: "Smartphone X1 is running low (5 left)",
    time: "5 hours ago",
    iconColor: "text-amber-500",
    user: {
      name: "System",
      image: "/avatars/04.png",
      initials: "SY",
    },
  },
  {
    icon: Users,
    title: "New user registered",
    description: "Michael Brown created an account",
    time: "1 day ago",
    iconColor: "text-indigo-500",
    user: {
      name: "Michael Brown",
      image: "/avatars/05.png",
      initials: "MB",
    },
  },
  {
    icon: Calendar,
    title: "Team meeting scheduled",
    description: "Marketing team meeting at 2pm",
    time: "2 days ago",
    iconColor: "text-red-500",
    user: {
      name: "Admin",
      image: "/avatars/06.png",
      initials: "AD",
    },
  },
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index}>
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-full p-2 ${activity.iconColor} bg-background`}
                >
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={activity.user.image}
                    alt={activity.user.name}
                  />
                  <AvatarFallback>{activity.user.initials}</AvatarFallback>
                </Avatar>
              </div>
              {index < activities.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
