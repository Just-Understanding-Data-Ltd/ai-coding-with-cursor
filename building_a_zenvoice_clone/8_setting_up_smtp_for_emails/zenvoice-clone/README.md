# SwiftVoice

SwiftVoice (SwiftVoice clone) is a self-serve invoice generation tool for Stripe users. It allows customers to generate, edit, and download invoices themselves, reducing manual work and customer support for businesses.

## Features

- Self-serve invoice generation for customers
- Compatible with Stripe accounts
- No Stripe Invoicing fee
- Editable invoices (VAT, Tax ID)
- Works with one-time purchases, subscriptions, and past transactions
- Multiple Stripe account support

## Tech Stack

- Frontend: Next.js, React, TypeScript
- UI Components: Shadcn UI, Radix UI
- Backend: Next.js API routes
- Database: Supabase
- Payment Processing: Stripe API

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables (Stripe API keys, Supabase credentials)
4. Run database migrations using Supabase CLI
5. Start the development server with `npm run dev`

## Stripe API Key Setup

To use SwiftVoice, you need to provide a restricted Stripe API key. Follow these steps:

1. [Generate a restricted API key](https://dashboard.stripe.com/apikeys/create?name=Invoicely&permissions%5B%5D=rak_file_write&permissions%5B%5D=rak_customer_read&permissions%5B%5D=rak_payment_intent_read&permissions%5B%5D=rak_bucket_connect_read&permissions%5B%5D=rak_credit_note_read&permissions%5B%5D=rak_checkout_session_read&permissions%5B%5D=rak_charge_read)
2. Do not change any resource permissions and click [Create Key] at the bottom right of the Stripe page.
3. Copy the restricted key (it should start with `rk_live_`) and use it in the Invoicely dashboard.

This restricted key ensures that Invoicely has the necessary permissions to function while maintaining the security of your Stripe account. It will populate invoices with your Stripe account's public business details.

## Main Components

1. Stripe Integration
2. User Authentication (using Supabase Auth)
3. Invoice Generation Engine
4. Customer Portal
5. Admin Dashboard

## Deployment

Deploy using Vercel or a similar platform that supports Next.js. Ensure proper configuration of Supabase and Stripe in the production environment.

## Pricing

- Basic Plan: $49 USD (one-time payment)
- Pro Plan: $69 USD (one-time payment)

## Support

For any issues or questions, contact support@SwiftVoice.com

# test
