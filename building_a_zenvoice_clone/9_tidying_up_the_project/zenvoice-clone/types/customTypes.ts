export interface DbStripeAccount {
  id: number;
  user_id: string;
  encrypted_stripe_api_key: string | null;
  stripe_account_id: string;
  created_at: string | null;
}

export interface StripeAccount extends DbStripeAccount {
  name: string;
  icon: string | null;
}

export interface CustomInvoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  customerName: string;
  customerEmail: string;
  billingDetails: {
    name: string;
    email: string;
    phone: string | null;
    address: {
      line1: string | null;
      line2: string | null;
      city: string | null | undefined;
      state: string | null;
      postal_code: string | null;
      country: string | null;
    } | null;
  };
  additionalInfo?: string | null;
  accountInfo: {
    stripe_account_id: string;
    company_name: string;
    company_address: string | null;
    company_phone: string;
  };
  subscriptionDetails?: {
    plan: string;
    interval: string;
    currentPeriodEnd: number;
  };
}
