import { AppConfig } from "@/types/config";
import { Search, BarChart, Inbox, Users, MessageSquare } from "lucide-react";
import { BillingMode } from "@/types/config";
import { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  hidden?: boolean;
}

interface DashboardConfig {
  sidebarNavItems: NavItem[];
}

export const config: AppConfig = {
  name: "Cursor Industries",
  domainName: "cursor.industries",
  appDescription:
    "Transform your product discovery experience with Cursor Industries' AI-powered meeting scheduler and intelligent chat assistant",
  company: {
    name: "Cursor Industries",
    address: "",
    phone: "",
    supportEmail: "support@cursor.industries",
  },
  indieMaker: {
    name: "James Phoenix",
    avatar:
      "https://understandingdata.com/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2Favatar.00f76042.webp&w=64&q=75",
    twitter: "https://twitter.com/jamesaphoenix12",
    linkedin: "https://www.linkedin.com/feed/",
    website: "https://understandingdata.com/",
  },
  googleTagManagerId: "GTM-PRC7J6X8",
  stripe: {
    publicKey:
      process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "default_public_key",
    secretKey: process.env.STRIPE_SECRET_KEY || "default_secret_key",
    webhookSecret:
      process.env.STRIPE_WEBHOOK_SECRET || "default_webhook_secret",
    plans: [
      {
        name: "Standard Plan",
        price: "$40",
        description: "Perfect for small to medium projects",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SINGLE_PAYMENT!,
        mode: "payment",
        features: [
          "Next.js boilerplate",
          "Supabase local stack",
          "Type Generation & Strong SDKs",
          "Stripe integration",
          "SEO & Blog setup",
          "Google OAuth & Magic Links",
          "Basic components & animations",
          "ChatGPT prompts for terms & privacy",
        ],
      },
      {
        name: "Pro Plan",
        price: "$60",
        description: "For serious SaaS builders",
        priceId:
          process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SINGLE_PAYMENT_SECONDARY!,
        mode: "payment",
        features: [
          "All Standard Plan features",
          "Advanced components & animations",
          "Discord community access",
          "Lifetime updates",
        ],
      },
    ],
  },
  environment: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  },
  auth: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    signInRedirectUrl: "/onboarding",
    authCallbackUrl: "/api/auth/callback",
    dashboardUrl: "/dashboard",
    loginUrl: "/login",
  },
  homepage: {
    numberOfMakersShipped: 50,
    heroTitle: "Cursor Industries Product Discovery",
    heroSubtitle:
      "Experience seamless product exploration with our intelligent chat assistant. Book meetings, understand our solutions, and get personalized recommendations through natural conversation.",
    usps: [
      {
        title: "Intelligent Scheduling",
        description:
          "Our AI chat assistant understands your needs and automatically finds the perfect meeting time with Cursor Industries experts.",
        icon: MessageSquare,
      },
      {
        title: "Smart Product Discovery",
        description:
          "Interactive conversations that help match your requirements with Cursor Industries' comprehensive solution suite.",
        icon: Search,
      },
      {
        title: "Automated Preparation",
        description:
          "Receive personalized meeting agendas and detailed product documentation before every Cursor Industries consultation.",
        icon: Users,
      },
    ],
    painPointsSection: {
      title:
        "Transform Your Product Discovery Experience with Cursor Industries",
      withoutProduct: {
        points: [
          "Time wasted on back-and-forth emails for scheduling",
          "Confusion about which product features match your needs",
          "Lack of preparation materials before meetings",
          "Difficulty in finding suitable meeting times",
          "Limited understanding of product offerings",
        ],
      },
      withProduct: {
        points: [
          "Instant meeting scheduling through AI chat",
          "Personalized Cursor Industries product recommendations",
          "Comprehensive meeting preparation guides",
          "Smart availability matching with our team",
          "Clear understanding of our solutions",
        ],
      },
    },
    featuresSection: {
      title: "Why Choose Cursor Industries?",
      useTabLayout: true,
      description:
        "Advanced AI-powered features for seamless product discovery",
      features: [
        {
          title: "Natural Language Scheduling",
          description:
            "Our AI understands your scheduling preferences and instantly finds the perfect meeting time with Cursor Industries experts.",
          image: "/features/scheduling.png",
          icon: MessageSquare,
        },
        {
          title: "Intelligent Product Matching",
          description:
            "Through natural conversation, our AI helps identify your needs and matches them with Cursor Industries' comprehensive solution suite.",
          image: "/features/discovery.png",
          icon: Search,
        },
        {
          title: "Automated Meeting Prep",
          description:
            "Receive personalized meeting agendas, product documentation, and preparation materials about Cursor Industries solutions.",
          image: "/features/preparation.png",
          icon: Users,
        },
        {
          title: "Smart Follow-up System",
          description:
            "Get automated reminders, meeting summaries, and easy rescheduling options for your Cursor Industries consultations.",
          image: "/features/followup.png",
          icon: Inbox,
        },
      ],
    },
    testimonials: [
      {
        imageId: 1,
        name: "David Chen",
        company: "Enterprise Solutions Director",
        quote:
          "Cursor Industries' chat bot made our product discovery process incredibly smooth. It understood our requirements perfectly and scheduled meetings with the right team members.",
      },
      {
        imageId: 2,
        name: "Sarah Miller",
        company: "Technology Lead",
        quote:
          "The automated meeting preparation and intelligent scheduling saved us hours of time. Cursor Industries' product recommendations were spot-on for our needs.",
      },
      {
        imageId: 3,
        name: "Alex Thompson",
        company: "Project Manager",
        quote:
          "Having an AI guide us through Cursor Industries' solutions helped us make informed decisions quickly. The entire process was effortless.",
      },
    ],
    faqs: [
      {
        question: "How does Cursor Industries' AI scheduling work?",
        answer:
          "Our AI chat bot uses natural language processing to understand your scheduling preferences, team availability, and time zone requirements. It automatically suggests optimal meeting times with Cursor Industries experts.",
      },
      {
        question: "What types of meetings can I schedule?",
        answer:
          "You can schedule product demos, technical consultations, discovery sessions, and follow-up meetings with Cursor Industries teams. Our AI helps determine the most appropriate meeting type based on your needs.",
      },
      {
        question: "How does the product discovery process work?",
        answer:
          "Through natural conversation, our AI learns about your requirements and challenges. It then recommends relevant Cursor Industries solutions and arranges meetings with our product specialists.",
      },
      {
        question: "What preparation materials are provided?",
        answer:
          "You'll receive customized Cursor Industries product documentation, meeting agendas, and relevant case studies based on your interests. All materials are automatically generated and sent before your meeting.",
      },
      {
        question: "Can I modify or reschedule meetings?",
        answer:
          "Yes, simply chat with our AI to modify or reschedule any meeting with Cursor Industries. It will handle all the updates and coordination with all participants automatically.",
      },
      {
        question: "Is the chat bot available 24/7?",
        answer:
          "Yes, Cursor Industries' AI chat bot is available 24/7 for scheduling, product inquiries, and general assistance. It schedules meetings during business hours while respecting all time zones.",
      },
      {
        question: "How does the AI understand my needs?",
        answer:
          "Our AI uses advanced natural language processing to understand your requirements, preferences, and challenges. It learns from each interaction to provide better recommendations for Cursor Industries solutions.",
      },
      {
        question: "What happens after scheduling a meeting?",
        answer:
          "You'll receive immediate confirmation, calendar invites, and preparation materials about Cursor Industries products. Our chat bot will send reminders and remain available for any pre-meeting questions.",
      },
    ],
    ctaSection: {
      title: "Ready to Discover Cursor Industries Solutions?",
      description:
        "Start chatting with our AI assistant to explore our products and schedule your ideal consultation.",
      ctaText: "Start Chat",
      ctaLink: "/login",
    },
  },
  blog: {
    title: "OctoSpark Blog",
    description:
      "Tips, strategies, and insights for social media growth and automation.",
  },
  dashboard: {
    sidebarNavItems: [
      // {
      //   title: "Workspaces",
      //   href: "workspaces",
      //   icon: Server,
      // },
      {
        title: "Chat",
        href: "[teamId]/chat",
        icon: MessageSquare,
      },
      // {
      //   title: "Video Content Strategy",
      //   href: "[teamId]/content-strategy",
      //   icon: BarChart,
      // },
      // {
      //   title: "Social Inbox",
      //   href: "[teamId]/inbox",
      //   icon: Inbox,
      // },
      // {
      //   title: "Social Accounts",
      //   href: "[teamId]/social-accounts",
      //   icon: Users,
      // },
      // {
      //   title: "Settings",
      //   href: "[teamId]/settings",
      //   icon: Home,
      // },
    ],
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  billing: {
    // NOTE If this is switched to consumption, then any plans on the client side before login will be ignored
    // and the user will be charged based on usage upon entering the dashboard.
    mode: "consumption" as BillingMode, // or 'subscription_and_single_pricing'
    consumption: {
      creditCost: 0.01, // $0.01 per credit
      minPurchase: 1000, // Minimum 1000 credits ($10)
      autoRechargeThreshold: 100, // Recharge when credits fall below 100
      autoRechargeAmount: 1000, // Recharge with 1000 credits
    },
  },
};

export const getEnvironment = () => {
  return config.environment;
};

export const getPlans = () => {
  return config.stripe.plans;
};

export const getCompanyInfo = () => {
  return config.company;
};

export const getBlogConfig = () => {
  return config.blog;
};

export const getDashboardConfig = (): DashboardConfig => {
  return {
    sidebarNavItems: config.dashboard.sidebarNavItems,
  };
};
