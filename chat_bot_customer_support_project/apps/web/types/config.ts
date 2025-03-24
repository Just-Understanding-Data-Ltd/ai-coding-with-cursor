import { LucideIcon } from "lucide-react";

export interface Plan {
  name: string;
  price: string;
  crossedOutPrice?: string;
  description: string;
  priceId: string;
  mode: "payment" | "subscription";
  features: string[];
}

export interface DashboardConfig {
  sidebarNavItems: {
    title: string;
    href: string;
    icon: LucideIcon;
  }[];
}

export interface USP {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface PainPointsSection {
  title: string;
  withoutProduct: {
    points: string[];
  };
  withProduct: {
    points: string[];
  };
}

export interface StripeConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  plans: Plan[];
}

export interface Environment {
  apiUrl: string;
}

export interface AuthConfig {
  siteUrl: string;
  signInRedirectUrl: string;
  authCallbackUrl: string;
  dashboardUrl: string;
  loginUrl: string;
}

export interface HomepageConfig {
  numberOfMakersShipped: number;
  heroTitle: string;
  heroSubtitle: string;
  usps: USP[];
  testimonials: Array<{
    name: string;
    company: string;
    quote: string;
    imageId: number;
  }>;
  ctaSection: {
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  };
  faqs: Array<{ question: string; answer: string }>;
  painPointsSection: PainPointsSection;
  featuresSection: FeaturesSection;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  supportEmail: string;
}

export interface AppConfig {
  name: string;
  domainName: string;
  dashboard: DashboardConfig;
  appDescription: string;
  company: CompanyInfo;
  stripe: StripeConfig;
  googleTagManagerId: string;
  environment: Environment;
  auth: AuthConfig;
  homepage: HomepageConfig;
  blog: BlogConfig;
  indieMaker: IndieMaker;
  billing: BillingConfig;
  supabase: {
    url: string;
    anonKey: string;
  };
}

export interface BlogConfig {
  title: string;
  description: string;
}

export interface Feature {
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
}

export interface FeaturesSection {
  title: string;
  description: string;
  useTabLayout?: boolean;
  features: Feature[];
}

export interface IndieMaker {
  name: string;
  avatar: string;
  twitter: string;
  linkedin: string;
  website: string;
}

export type BillingMode = "consumption" | "subscription_and_single_pricing";

export interface BillingConfig {
  mode: BillingMode;
  consumption: {
    creditCost: number;
    minPurchase: number;
    autoRechargeThreshold: number;
    autoRechargeAmount: number;
  };
}
