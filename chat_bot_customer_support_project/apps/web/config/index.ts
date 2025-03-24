import { AppConfig } from "@/types/config";
import {
  Search,
  BarChart,
  Clock,
  Server,
  Home,
  Inbox,
  Users,
  MessageSquare,
} from "lucide-react";
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
  name: "OctoSpark",
  domainName: "OctoSpark.ai",
  appDescription:
    "Transform social media management with AI-powered inbox and intelligent video content strategies",
  company: {
    name: "OctoSpark",
    address: "",
    phone: "",
    supportEmail: "support@OctoSpark.ai",
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
    heroTitle: "Social Media Management Made Effortless",
    heroSubtitle:
      "Streamline your social media interactions with AI-powered commenting and generate data-driven content strategies from video analysis.",
    usps: [
      {
        title: "AI-Powered Inbox",
        description:
          "Manage all your social accounts from a unified inbox with intelligent comment automation.",
        icon: Inbox,
      },
      {
        title: "Video-Based Content Strategies",
        description:
          "Analyze 500+ competitor videos to generate actionable content strategies for your brand.",
        icon: BarChart,
      },
      {
        title: "Team Collaboration",
        description:
          "Seamlessly work with internal teams and clients through shared workspaces.",
        icon: Users,
      },
    ],
    painPointsSection: {
      title: "Revolutionize Your Social Media Management",
      withoutProduct: {
        points: [
          "Overwhelmed by managing multiple social accounts",
          "Hours wasted watching competitor videos for ideas",
          "Missed engagement opportunities",
          "Inconsistent community management",
          "Struggle to stay on top of comments and messages",
        ],
      },
      withProduct: {
        points: [
          "Unified inbox for all social platforms",
          "AI-generated content strategies from video analysis",
          "Automated comment management",
          "Consistent brand engagement",
          "Never miss important interactions",
        ],
      },
    },
    featuresSection: {
      title: "Powerful Tools for Modern Social Media Teams",
      useTabLayout: true,
      description: "Everything you need to excel at social media management",
      features: [
        {
          title: "Unified Social Inbox",
          description:
            "Manage comments and messages from all your social accounts in one place. Prioritize, filter, and respond to interactions efficiently.",
          image: "/features/inbox.png",
          icon: Inbox,
        },
        {
          title: "AI Comment Management",
          description:
            "Let AI handle routine comments and flag important ones for your attention. Set up automated responses that match your brand voice.",
          image: "/features/ai-commenting.png",
          icon: Search,
        },
        {
          title: "Video Content Analysis",
          description:
            "Our AI analyzes 500+ videos from your competitors and industry to generate data-driven content strategies unique to your brand.",
          image: "/features/video-analysis.png",
          icon: BarChart,
        },
        {
          title: "Team Collaboration",
          description:
            "Work seamlessly with your team and clients through shared workspaces. Assign tasks, share insights, and maintain brand consistency.",
          image: "/features/team-collab.png",
          icon: Users,
        },
      ],
    },
    testimonials: [
      {
        imageId: 1,
        name: "Sarah Johnson",
        company: "Social Media Manager",
        quote:
          "OctoSpark's AI comment management has transformed our workflow. We're responding faster and maintaining better relationships with our audience.",
      },
      {
        imageId: 2,
        name: "Michael Chen",
        company: "Digital Marketing Agency",
        quote:
          "The video analysis feature gave us insights we would have missed. Our content strategy is now data-driven and much more effective.",
      },
      {
        imageId: 3,
        name: "Emily Rodriguez",
        company: "Tech Startup",
        quote:
          "Managing multiple social accounts was a nightmare before OctoSpark. Now our entire team stays on the same page with the unified inbox.",
      },
    ],
    faqs: [
      {
        question: "How does OctoSpark's AI comment management work?",
        answer:
          "Our AI analyzes incoming comments across your social platforms, categorizes them by sentiment and intent, and can automatically respond to routine inquiries while flagging important ones for your attention. You can customize response templates and train the AI on your brand voice.",
      },
      {
        question: "Which social media platforms do you support?",
        answer:
          "We currently support Facebook, Instagram, and TikTok, with more platforms coming soon. You can manage all your accounts from a single unified inbox.",
      },
      {
        question: "How does the video content analysis work?",
        answer:
          "Our AI downloads and analyzes up to 500 videos from your competitors and industry leaders. It identifies trends, engagement patterns, content themes, and optimal formats, then generates actionable content strategies tailored to your brand and audience.",
      },
      {
        question: "How long does it take to analyze 500 videos?",
        answer:
          "The initial analysis takes 24-48 hours, depending on the complexity of your industry and the specific accounts being analyzed. After the initial analysis, our system provides regular updates based on new content.",
      },
      {
        question: "Can I manage multiple brands or clients?",
        answer:
          "Yes, our platform supports organization and team management, allowing you to manage multiple brands or clients under a single account with customized permissions and workspaces.",
      },
      {
        question: "How do you ensure the quality of AI responses?",
        answer:
          "Our AI is trained on successful social media interactions and follows your brand guidelines. You can review all automated responses, set up approval workflows for specific scenarios, and continuously train the system through feedback.",
      },
      {
        question: "Do you offer moderation features?",
        answer:
          "Yes, our platform includes advanced moderation tools to automatically hide or flag inappropriate comments, spam, and negative sentiment. You can customize moderation rules based on your specific needs.",
      },
      {
        question: "How do team permissions work?",
        answer:
          "You can assign different roles and permissions to team members and clients, controlling access to specific features, accounts, and actions. This ensures everyone has the access they need while maintaining security.",
      },
    ],
    ctaSection: {
      title: "Ready to Transform Your Social Media Management?",
      description:
        "Start managing your social accounts more efficiently with AI-powered tools.",
      ctaText: "Get Started",
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
