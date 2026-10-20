# NexiInvoice To NexiSlip — Full-Stack SaaS Invoice & Slip Generation Platform

The Quickest Way to Bill Your Clients.

NexiInvoice To NexiSlip (NexiSlip) is a full-stack SaaS invoice generation and client billing platform built for freelancers, agencies, consultants, and growing businesses worldwide.

## Features

- **Split-Screen Invoice Builder**: Live dynamic preview with instant decimal arithmetic, configurable tax rates, line items, and multi-currency formatting.
- **Multiple File Exports**:
  - Vector PDF (`.pdf`) via `jsPDF`
  - High-Resolution PNG (`.png`) via `html-to-image`
  - High-Quality JPG (`.jpg`)
  - Genuine Microsoft Word (`.docx`) documents via `docx` library
  - Browser print support
- **Server-Side Quota Enforcement**: Free users are limited to 3 newly created invoices per calendar day by backend validation.
- **AI Integrations**:
  - Low-latency invoice suggestions using `gemini-3.1-flash-lite` (instant service line items and payment notes)
  - Custom logo and brand seal generator using `gemini-nano-banana-2.1` with custom aspect ratios (`1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `9:16`, `16:9`, `21:9`)
- **Subscriptions & Billing**:
  - Free ($0): 3 invoices/day
  - Monthly Pro ($1/mo): Unlimited invoices
  - Annual Pro ($8/year): Save 33% ($4/year savings compared to $12 monthly)
- **Separate Administrator Portal (`/admin`)**:
  - Protected with role-based access control for `sachithakaumina0@gmail.com`
  - Automatic Enterprise Admin entitlement
  - Real-time analytics tracking online presence (heartbeat < 2 min), active users (7d/30d), and plan distribution
  - User management table and audit logging
- **Zero-Trust Security**: Cloud Firestore security rules with document isolation (`ownerId == request.auth.uid`).

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express, `server.ts`
- **Database & Auth**: Google Cloud Firestore & Firebase Authentication
- **AI**: `@google/genai` SDK (`gemini-3.1-flash-lite`, `gemini-nano-banana-2.1`)
- **Document Generation**: `jspdf`, `html-to-image`, `docx`, `file-saver`

## Setup & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the application.
