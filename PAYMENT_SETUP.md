# NexiInvoice Payment Gateway Setup (Stripe)

This guide documents the payment architecture, subscription lifecycle, and steps required to connect live Stripe billing to NexiInvoice.

## 1. Customer-Facing Pricing Plans

NexiInvoice supports three tiers:

| Plan | Price | Billing Frequency | Daily Limit | Savings / Discount |
|---|---|---|---|---|
| **Free** | $0 | Forever free | 3 invoices/day | Base tier |
| **Monthly Pro** | $1 USD | Recurring Monthly | Unlimited | $1/mo |
| **Annual Pro** | $8 USD | Recurring 12 Months | Unlimited | **SAVE 33%** ($4/year savings compared to $12) |

## 2. Environment Variables Configuration

Add the following keys to your server environment secrets (in AI Studio Settings > Secrets or `.env`):

```bash
# Stripe Merchant Secret Key
STRIPE_SECRET_KEY="sk_live_..."

# Stripe Webhook Signing Secret (from Stripe Dashboard > Developers > Webhooks)
STRIPE_WEBHOOK_SECRET="whsec_..."

# Recurring Price Identifiers created in Stripe Dashboard
STRIPE_MONTHLY_PRICE_ID="price_1..." # Configured at $1.00 USD/month
STRIPE_ANNUAL_PRICE_ID="price_1..."  # Configured at $8.00 USD/year
```

## 3. Stripe Dashboard Setup

1. **Create Products in Stripe**:
   - Product: **NexiInvoice Pro**
   - Price 1: `$1.00 USD`, recurring every `month`. Copy ID to `STRIPE_MONTHLY_PRICE_ID`.
   - Price 2: `$8.00 USD`, recurring every `12 months`. Copy ID to `STRIPE_ANNUAL_PRICE_ID`.
2. **Configure Webhook Endpoint**:
   - Endpoint URL: `https://YOUR_DOMAIN/api/billing/webhook`
   - Events to listen:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
3. **Idempotency & Safety**:
   - The webhook handler uses idempotent transaction checks to prevent duplicate entitlement updates if webhooks are retried.
   - A success redirect URL alone never unlocks paid status; only cryptographically signed webhook receipts mutate entitlements.

## 4. Development Sandbox Mode

When `STRIPE_SECRET_KEY` is not present or contains placeholders, NexiInvoice honestly displays a "Payments Not Configured" dialog and offers an explicit development sandbox toggle so engineers and QA testers can verify unlimited plan entitlements without executing live credit card transactions.
