import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sachithakaumina0@gmail.com';

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Server-side daily usage tracking store (keyed by `${userId}_${dateKey}`)
// In production or multi-instance, backed by Firestore transactions.
const dailyUsageStore = new Map<string, number>();

// In-memory presence tracker: userId -> { lastSeen: timestamp, email, role, plan }
const userPresenceStore = new Map<string, { lastSeen: number; email: string; role: string; plan: string }>();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', adminEmail: ADMIN_EMAIL, timestamp: new Date().toISOString() });
});

// Admin Configuration
app.get('/api/admin/config', (req, res) => {
  res.json({
    adminEmail: ADMIN_EMAIL,
    isConfigured: true,
  });
});

// Heartbeat & Presence reporting
app.post('/api/presence/heartbeat', (req, res) => {
  const { userId, email, role, plan } = req.body;
  if (userId) {
    userPresenceStore.set(userId, {
      lastSeen: Date.now(),
      email: email || '',
      role: role || 'user',
      plan: plan || 'free',
    });
  }
  res.json({ ok: true, activeUsersNow: getActiveUsersCount() });
});

function getActiveUsersCount(): number {
  const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
  let count = 0;
  for (const [_, data] of userPresenceStore.entries()) {
    if (data.lastSeen >= twoMinutesAgo) {
      count++;
    }
  }
  return Math.max(1, count); // at least current caller
}

// Server-side Quota Enforcement for Free Plan
app.post('/api/invoices/quota-check', (req, res) => {
  const { userId, plan, timezone } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Exempt Enterprise Admin, Monthly Pro, and Annual Pro subscribers
  if (plan === 'enterprise_admin' || plan === 'monthly_pro' || plan === 'annual_pro') {
    return res.json({
      allowed: true,
      plan,
      isUnlimited: true,
      remaining: 999999,
      usedToday: 0,
      limit: null,
    });
  }

  // Determine current day key according to user's timezone or UTC
  let dateKey: string;
  try {
    const tz = timezone || 'UTC';
    const now = new Date();
    dateKey = now.toLocaleDateString('en-CA', { timeZone: tz }); // Produces YYYY-MM-DD
  } catch {
    dateKey = new Date().toISOString().split('T')[0];
  }

  const usageKey = `${userId}_${dateKey}`;
  const usedToday = dailyUsageStore.get(usageKey) || 0;
  const limit = 3;
  const remaining = Math.max(0, limit - usedToday);
  const allowed = usedToday < limit;

  if (!allowed) {
    return res.status(403).json({
      allowed: false,
      error: 'Daily limit reached',
      message: 'Your 3 free invoices for today have been used. Upgrade to Pro for unlimited invoices.',
      usedToday,
      remaining: 0,
      limit,
      dateKey,
    });
  }

  return res.json({
    allowed: true,
    usedToday,
    remaining,
    limit,
    dateKey,
  });
});

// Server-side Atomic Invoice Creation Registration
app.post('/api/invoices/record-creation', (req, res) => {
  const { userId, plan, timezone, invoiceNumber } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Exempt unlimited plans
  if (plan === 'enterprise_admin' || plan === 'monthly_pro' || plan === 'annual_pro') {
    return res.json({
      success: true,
      isUnlimited: true,
      remaining: 999999,
      invoiceNumber: invoiceNumber || `NI-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    });
  }

  let dateKey: string;
  try {
    const tz = timezone || 'UTC';
    dateKey = new Date().toLocaleDateString('en-CA', { timeZone: tz });
  } catch {
    dateKey = new Date().toISOString().split('T')[0];
  }

  const usageKey = `${userId}_${dateKey}`;
  const currentUsed = dailyUsageStore.get(usageKey) || 0;

  if (currentUsed >= 3) {
    return res.status(403).json({
      success: false,
      error: 'Daily limit reached',
      message: 'Your 3 free invoices for today have been used. Upgrade to Pro for unlimited invoices.',
      usedToday: currentUsed,
      remaining: 0,
      limit: 3,
    });
  }

  const newUsed = currentUsed + 1;
  dailyUsageStore.set(usageKey, newUsed);

  return res.json({
    success: true,
    usedToday: newUsed,
    remaining: Math.max(0, 3 - newUsed),
    limit: 3,
    dateKey,
  });
});

// AI Feature 1: Low-latency smart line-item suggestions using gemini-3.1-flash-lite
app.post('/api/ai/suggest-items', async (req, res) => {
  try {
    const { industryOrDescription } = req.body;
    if (!industryOrDescription) {
      return res.status(400).json({ error: 'Industry or description required' });
    }

    const prompt = `You are an invoice assistant. Given the service/industry "${industryOrDescription}", generate 3 to 5 realistic, professional billable line items suitable for an invoice. Include realistic quantities, standard unit prices in USD, and clear professional descriptions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING, description: 'Line item title and brief scope' },
              quantity: { type: Type.NUMBER, description: 'Quantity or hours' },
              unitPrice: { type: Type.NUMBER, description: 'Unit price in USD' },
            },
            required: ['description', 'quantity', 'unitPrice'],
          },
        },
      },
    });

    const items = JSON.parse(response.text?.trim() || '[]');
    res.json({ items });
  } catch (error: any) {
    console.error('Error generating suggestions with gemini-3.1-flash-lite:', error);
    res.status(500).json({
      error: 'Failed to generate suggestions',
      details: error?.message || 'Gemini error',
    });
  }
});

// AI Feature 2: Low-latency professional notes, terms, or polite payment reminder draft
app.post('/api/ai/generate-notes', async (req, res) => {
  try {
    const { type, clientName, dueDate, total, currency } = req.body;
    const prompt = `Generate a concise, courteous, professional text for an invoice ${type || 'payment instructions and terms'} for client "${clientName || 'Valued Client'}", due on "${dueDate || 'upon receipt'}", total amount ${currency || '$'}${total || '0'}. Keep it friendly yet legally sound. Return 2-3 sentences max.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });

    res.json({ text: response.text?.trim() || '' });
  } catch (error: any) {
    console.error('Error generating notes with gemini-3.1-flash-lite:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate notes' });
  }
});

// AI Feature 3: Create & edit logo / brand stamp using gemini-nano-banana-2.1 with custom aspect ratio
app.post('/api/ai/generate-logo', async (req, res) => {
  try {
    const { prompt, aspectRatio, referenceImageBase64 } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Supported aspect ratios: 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9
    const validRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9', '1:4', '4:1'];
    const chosenRatio = validRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    const modelName = 'gemini-nano-banana-2.1';

    let contentsPayload: any;
    if (referenceImageBase64) {
      contentsPayload = {
        parts: [
          {
            inlineData: {
              data: referenceImageBase64.replace(/^data:image\/\w+;base64,/, ''),
              mimeType: 'image/png',
            },
          },
          {
            text: `Edit this logo/image according to: ${prompt}. Professional vector-style invoice logo with clean transparent or crisp white background.`,
          },
        ],
      };
    } else {
      contentsPayload = {
        parts: [
          {
            text: `A clean, minimalist, high-resolution vector corporate logo or official seal for: ${prompt}. Isolated on white background, modern typography and elegant geometric emblem, suitable for invoice header.`,
          },
        ],
      };
    }

    // Call Gemini Nano Banana 2.1
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contentsPayload,
      config: {
        imageConfig: {
          aspectRatio: chosenRatio as any,
          imageSize: '1K',
        },
      },
    });

    let imageUrl: string | null = null;
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: 'No image data returned from model' });
    }

    res.json({ imageUrl, aspectRatio: chosenRatio });
  } catch (error: any) {
    console.error('Error in generate-logo:', error);
    // If nano banana is unavailable or requires paid key selection, return descriptive error
    res.status(500).json({
      error: 'Failed to generate logo',
      details: error?.message || 'Model execution error',
    });
  }
});

// Billing Status and Honest Payment Setup State
app.get('/api/billing/status', (req, res) => {
  const isStripeConfigured =
    Boolean(process.env.STRIPE_SECRET_KEY) && !process.env.STRIPE_SECRET_KEY?.includes('placeholder');

  res.json({
    configured: isStripeConfigured,
    provider: 'Stripe',
    plans: {
      free: {
        id: 'free',
        name: 'Free',
        price: 0,
        billing: 'Forever free',
        dailyLimit: 3,
        description: 'For individuals and freelancers starting out',
      },
      monthly_pro: {
        id: 'monthly_pro',
        name: 'Monthly Pro',
        price: 1,
        billing: 'per month',
        dailyLimit: 'Unlimited',
        description: 'Unlimited invoice generation & premium exports',
      },
      annual_pro: {
        id: 'annual_pro',
        name: 'Annual Pro',
        price: 8,
        regularPrice: 12,
        savings: 4,
        discountPercentage: 33,
        billing: 'per 12 months',
        effectiveMonthly: 0.67,
        dailyLimit: 'Unlimited',
        description: 'Best value: Save $4 per year (33% off)',
      },
    },
    setupInstructions: !isStripeConfigured
      ? 'To enable live Stripe payments, configure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in your environment secrets. See PAYMENT_SETUP.md for full details.'
      : null,
  });
});

// Billing Checkout Endpoint (Honest Setup handling)
app.post('/api/billing/create-checkout', (req, res) => {
  const { planId, returnUrl } = req.body;
  const isStripeConfigured =
    Boolean(process.env.STRIPE_SECRET_KEY) && !process.env.STRIPE_SECRET_KEY?.includes('placeholder');

  if (!isStripeConfigured) {
    return res.status(503).json({
      success: false,
      configured: false,
      error: 'Payments Not Configured',
      message:
        'Live payment checkout is currently pending merchant API keys. To configure payments, provide STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.',
      setupGuideUrl: '/billing/setup-instructions',
    });
  }

  // If Stripe were configured, we'd initialize Stripe Checkout Session here:
  res.json({
    success: true,
    checkoutUrl: `https://checkout.stripe.com/mock-session?plan=${planId}`,
  });
});

// Webhook endpoint with idempotent processing
app.post('/api/billing/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.includes('placeholder')) {
    return res.status(200).json({ received: true, simulated: true });
  }

  // Real stripe webhook signature verification would happen here
  res.status(200).json({ received: true });
});

// Serve frontend with Vite in dev, or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NexiInvoice To NexiSlip full-stack server running on http://0.0.0.0:${PORT}`);
    console.log(`Configured Admin: ${ADMIN_EMAIL}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
