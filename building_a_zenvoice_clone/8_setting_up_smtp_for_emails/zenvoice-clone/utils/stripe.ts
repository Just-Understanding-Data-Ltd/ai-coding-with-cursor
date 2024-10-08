import Stripe from "stripe";
import { decryptStripeApiKey } from "./encryption";
import { CustomInvoice } from "@/types/customTypes";
import { config } from "@/config";

const stripeConfig =
  config.stripe[
    process.env.NODE_ENV === "production" ? "production" : "development"
  ];

export const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: "2024-09-30.acacia",
});

export async function createStripeClient(
  encryptedApiKey: string
): Promise<Stripe> {
  const decryptedApiKey = await decryptStripeApiKey(encryptedApiKey);
  return new Stripe(decryptedApiKey, {
    apiVersion: "2024-09-30.acacia",
  });
}

export async function fetchInvoices(
  customerEmail: string,
  stripeAccounts: Array<{
    stripe_account_id: string;
    encrypted_stripe_api_key: string | null;
  }>
): Promise<{
  singlePayments: CustomInvoice[];
  subscriptions: CustomInvoice[];
}> {
  const formatAddress = (
    address: Stripe.Address | null | undefined
  ): string | null => {
    if (!address) return null;
    return `${address.line1 || ""}, ${address.city || ""}, ${
      address.state || ""
    }, ${address.postal_code || ""}, ${address.country || ""}`.trim();
  };

  const getCompanyInfo = (accountInfo: Stripe.Account) => {
    const businessProfile = accountInfo.business_profile;
    const legalEntity = accountInfo.individual || accountInfo.company;

    return {
      company_name:
        businessProfile?.name ||
        (legalEntity && "name" in legalEntity ? legalEntity.name : "") ||
        accountInfo.settings?.dashboard.display_name ||
        "",
      company_address:
        formatAddress(businessProfile?.support_address) ||
        (legalEntity && "address" in legalEntity
          ? formatAddress(legalEntity.address)
          : null),
      company_phone:
        businessProfile?.support_phone ||
        (legalEntity && "phone" in legalEntity ? legalEntity.phone : "") ||
        "",
    };
  };

  const allInvoices = await Promise.all(
    stripeAccounts.map(async (account) => {
      if (!account.encrypted_stripe_api_key) {
        return { singlePayments: [], subscriptions: [] };
      }
      const stripe = await createStripeClient(account.encrypted_stripe_api_key);
      const customer = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      // Fetch account information
      const accountInfo = await stripe.accounts.retrieve(
        account.stripe_account_id
      );

      if (customer.data.length === 0) {
        return { singlePayments: [], subscriptions: [] };
      }

      const customerId = customer.data[0].id;

      try {
        // Fetch all charges
        const charges = await stripe.charges.list({
          limit: 100,
          customer: customerId,
          expand: ["data.invoice"],
        });

        // Fetch all subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "all",
          expand: ["data.latest_invoice"],
        });

        const singlePayments: CustomInvoice[] = [];
        const subscriptionPayments: CustomInvoice[] = [];

        // Process charges
        for (const charge of charges.data) {
          const invoice = charge.invoice as Stripe.Invoice | null;
          if (!invoice || !invoice.subscription) {
            // This is a single payment
            singlePayments.push({
              id: charge.id,
              amount: charge.amount,
              currency: charge.currency,
              status: charge.status,
              created: charge.created,
              customerName: customer.data[0].name || "",
              customerEmail: customer.data[0].email || "",
              billingDetails: {
                name:
                  charge.billing_details.name || customer.data[0].name || "",
                email:
                  charge.billing_details.email || customer.data[0].email || "",
                phone:
                  charge.billing_details.phone ||
                  customer.data[0].phone ||
                  null,
                address:
                  charge.billing_details.address ||
                  customer.data[0].address ||
                  null,
              },
              accountInfo: {
                stripe_account_id: account.stripe_account_id,
                ...getCompanyInfo(accountInfo),
              },
            });
          } else {
            // This is a subscription payment
            const subscription = subscriptions.data.find(
              (sub) => sub.id === invoice.subscription
            );
            if (subscription) {
              subscriptionPayments.push({
                id: charge.id,
                amount: charge.amount,
                currency: charge.currency,
                status: charge.status,
                created: charge.created,
                customerName: customer.data[0].name || "",
                customerEmail: customer.data[0].email || "",
                billingDetails: {
                  name:
                    charge.billing_details.name || customer.data[0].name || "",
                  email:
                    charge.billing_details.email ||
                    customer.data[0].email ||
                    "",
                  phone:
                    charge.billing_details.phone ||
                    customer.data[0].phone ||
                    null,
                  address:
                    charge.billing_details.address ||
                    customer.data[0].address ||
                    null,
                },
                accountInfo: {
                  stripe_account_id: account.stripe_account_id,
                  ...getCompanyInfo(accountInfo),
                },
                subscriptionDetails: {
                  plan:
                    subscription.items.data[0]?.plan.nickname || "Unknown Plan",
                  interval:
                    subscription.items.data[0]?.plan.interval || "unknown",
                  currentPeriodEnd: subscription.current_period_end,
                },
              });
            }
          }
        }
        return {
          singlePayments,
          subscriptions: subscriptionPayments,
        };
      } catch (error) {
        console.error(
          `Error fetching invoices for account ${account.stripe_account_id}:`,
          error
        );
        return { singlePayments: [], subscriptions: [] };
      }
    })
  );
  return {
    singlePayments: allInvoices.flatMap((result) => result.singlePayments),
    subscriptions: allInvoices.flatMap((result) => result.subscriptions),
  };
}
