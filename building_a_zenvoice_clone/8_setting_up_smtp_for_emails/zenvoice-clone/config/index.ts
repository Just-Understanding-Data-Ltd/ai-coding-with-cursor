export interface Plan {
  name: string;
  price: string;
  description: string;
  priceId: string;
  mode: "payment" | "subscription";
}

export interface USP {
  title: string;
  description: string;
  icon: string;
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
  heroTitle: string;
  heroSubtitle: string;
  usps: USP[];
  testimonials: Array<{ name: string; company: string; quote: string }>;
  faqs: Array<{ question: string; answer: string }>;
  painPointsSection: PainPointsSection;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
}

export interface AppConfig {
  name: string;
  company: CompanyInfo;
  stripe: {
    development: StripeConfig;
    production: StripeConfig;
  };
  environment: Environment;
  auth: AuthConfig;
  homepage: HomepageConfig;
}

export const config: AppConfig = {
  name: "SwiftVoice",
  company: {
    name: "SwiftVoice Inc.",
    address: "Orchard House, Long Orchard Drive, Penn, HP108DD",
    phone: "+447950791582",
  },
  stripe: {
    development: {
      publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY_DEV!,
      secretKey: process.env.STRIPE_SECRET_KEY_DEV!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_DEV!,
      plans: [
        {
          name: "Single Payment (Dev)",
          price: "$50",
          description: "One-time payment for lifetime access (Development)",
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SINGLE_PAYMENT_DEV!,
          mode: "payment",
        },
        {
          name: "Monthly Subscription (Dev)",
          price: "$5/month",
          description: "Recurring monthly payment (Development)",
          priceId:
            process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY_SUBSCRIPTION_DEV!,
          mode: "subscription",
        },
      ],
    },
    production: {
      publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY_PROD!,
      secretKey: process.env.STRIPE_SECRET_KEY_PROD!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_PROD!,
      plans: [
        {
          name: "Single Payment",
          price: "$99",
          description: "One-time payment for lifetime access",
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SINGLE_PAYMENT_PROD!,
          mode: "payment",
        },
        {
          name: "Monthly Subscription",
          price: "$9.99/month",
          description: "Recurring monthly payment",
          priceId:
            process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY_SUBSCRIPTION_PROD!,
          mode: "subscription",
        },
      ],
    },
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
    heroTitle: "Focus on your startup, not the invoices",
    heroSubtitle:
      "Let your customers generate, edit, and download Stripe invoices, so you don't have to.",
    usps: [
      {
        title: "1-minute no-code setup",
        description:
          "Connect your Stripe account and start using SwiftVoice in minutes.",
        icon: "Clock",
      },
      {
        title: "Reduce customer support",
        description:
          "Empower your customers to generate their own invoices, reducing support requests.",
        icon: "Users",
      },
      {
        title: "No Stripe invoice fee",
        description: "Save on Stripe's 0.4% invoice fee by using SwiftVoice.",
        icon: "DollarSign",
      },
    ],
    testimonials: [
      {
        name: "Dan Kulkov",
        company: "Startup Founder",
        quote:
          "SwiftVoice solved this problem once and for all. The app is simple, but it nails the job perfectly.",
      },
      {
        name: "Sarah Johnson",
        company: "E-commerce Manager",
        quote:
          "SwiftVoice has saved us countless hours in customer support. Our clients love the self-serve invoice feature!",
      },
      {
        name: "Michael Chen",
        company: "SaaS Entrepreneur",
        quote:
          "The time and money we've saved with SwiftVoice has been a game-changer for our business. Highly recommended!",
      },
    ],
    faqs: [
      {
        question: "Why do I need SwiftVoice?",
        answer:
          "SwiftVoice automates the invoice generation process, saving you time and reducing customer support requests related to invoices.",
      },
      {
        question: "How does SwiftVoice work with Stripe?",
        answer:
          "SwiftVoice integrates seamlessly with your Stripe account, allowing customers to generate invoices for their purchases without you having to manually create them.",
      },
      {
        question: "Is SwiftVoice secure?",
        answer:
          "Yes, SwiftVoice uses industry-standard security practices and doesn't store sensitive payment information. We only use restricted API keys to interact with your Stripe account.",
      },
      {
        question: "Can I customize the invoice template?",
        answer:
          "Currently, SwiftVoice uses Stripe's default invoice template. We're working on adding customization options in future updates.",
      },
      {
        question: "Does SwiftVoice work with other payment processors?",
        answer:
          "At the moment, SwiftVoice is designed to work exclusively with Stripe. We may consider adding support for other payment processors in the future.",
      },
      {
        question: "How much time can I save using SwiftVoice?",
        answer:
          "Depending on your volume of invoice requests, you can save several hours per week that would otherwise be spent on manual invoice generation and customer support.",
      },
      {
        question: "Is there a limit to the number of invoices I can generate?",
        answer:
          "No, there's no limit to the number of invoices you can generate with SwiftVoice. Our pricing is not based on invoice volume.",
      },
      {
        question: "Can customers edit their invoices after generation?",
        answer:
          "Yes, customers can edit certain details like their billing information on the generated invoices. However, they cannot change the amount or items listed.",
      },
      {
        question: "Do I need technical knowledge to set up SwiftVoice?",
        answer:
          "Not at all! SwiftVoice is designed for easy setup without any coding required. You can be up and running in just a few minutes.",
      },
      {
        question: "What kind of support does SwiftVoice offer?",
        answer:
          "We offer email support for all our customers. Our premium plans also include priority support with faster response times.",
      },
    ],
    painPointsSection: {
      title: "Tired of managing Stripe invoices?",
      withoutProduct: {
        points: [
          "Manually create invoices",
          "Pay up to $2 per invoice",
          "Waste hours in customer support",
          "Can't update details once sent",
          "Can't make invoices for previous purchases",
        ],
      },
      withProduct: {
        points: [
          "Self-serve invoices",
          "One-time payment for unlimited invoices",
          "No more customer support",
          "Editable invoices to stay compliant",
          "Invoices for any payment, even past ones",
        ],
      },
    },
  },
};

export const getStripeConfig = (): StripeConfig => {
  return process.env.NODE_ENV === "production"
    ? config.stripe.production
    : config.stripe.development;
};

export const getEnvironment = (): Environment => {
  return config.environment;
};

export const getPlans = (): Plan[] => {
  return getStripeConfig().plans;
};

export const getCompanyInfo = (): CompanyInfo => {
  return config.company;
};
