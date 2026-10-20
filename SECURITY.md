# NexiInvoice Security Architecture

This document describes the multi-tenant security architecture, authorization rules, and zero-trust guidelines deployed across the NexiInvoice platform.

## 1. Zero-Trust Access Control (ABAC)

NexiInvoice protects all user and business financial data through Attribute-Based Access Control enforced on Cloud Firestore and server-side endpoints:

1. **Document Isolation**: Every invoice document contains an immutable `ownerId` bound to the authenticated Firebase UID (`request.auth.uid`). Users can only query, read, write, or delete invoices where `resource.data.ownerId == request.auth.uid`.
2. **Anti-Update Gap Protections**: Writes cannot tamper with ownership or inject unauthorized privilege fields. Key modification is restricted on the server.
3. **No Blanket Reads**: Blanket collection queries (`allow list: if isSignedIn();`) are strictly prohibited in `firestore.rules`. Firestore rules force all client list queries to be filtered by `where('ownerId', '==', auth.uid)`.

## 2. Server-Side Daily Quota Enforcement

The Free Plan quota (maximum 3 new invoices per calendar day) is strictly validated and enforced by trusted backend endpoints (`/api/invoices/record-creation` and `/api/invoices/quota-check`):
* Client-supplied counts or date keys are never trusted.
* Daily boundaries are determined based on the user's configured timezone or UTC.
* Atomic increments prevent concurrent race conditions from bypassing the limit.
* Enterprise Admin and Pro subscribers (`monthly_pro`, `annual_pro`) receive server-verified exemptions.

## 3. Administrative Privileges & Enterprise Admin Grant

1. **Environment Configuration**: The initial authorized administrator email is configured via `ADMIN_EMAIL` (`sachithakaumina0@gmail.com`).
2. **Immutable Role Grants**: Users cannot promote themselves to administrators via frontend requests or self-assign the Enterprise Admin entitlement.
3. **Protected Admin Portal**: Endpoints and analytics dashboards under `/admin` verify the authenticated identity against the administrative registry before serving data.

## 4. Payment Credentials & PCI Compliance

* Live secret credentials (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) remain strictly server-side in environment variables and are never bundled into client code.
* Credit card numbers, CVVs, and banking details are never stored in the database.
* Webhook requests verify cryptographic signatures before mutating subscription states.
