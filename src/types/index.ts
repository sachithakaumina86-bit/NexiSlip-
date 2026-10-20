export type UserRole = 'user' | 'admin';

export type PlanType = 'free' | 'monthly_pro' | 'annual_pro' | 'enterprise_admin';

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due';

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export type InvoiceTemplateId = 'modern' | 'minimal' | 'classic' | 'professional' | 'creative';

export interface BusinessProfile {
  businessName: string;
  sellerName: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  taxNumber?: string;
  logoUrl?: string;
  defaultCurrency: string;
  defaultTerms: string;
  defaultTaxRate: number;
  defaultTemplate: InvoiceTemplateId;
}

export interface UserProfile {
  id: string; // Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  plan: PlanType;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartedAt?: string;
  subscriptionEndsAt?: string;
  businessProfile?: BusinessProfile;
  invoiceCount: number;
  timezone: string;
  themePreference: 'light' | 'dark' | 'system';
  lastLoginAt: string;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number; // item level discount in currency amount or %
  total: number;
}

export interface ClientDetails {
  clientName: string;
  email: string;
  phone?: string;
  address: string;
  taxNumber?: string;
}

export interface Invoice {
  id: string;
  ownerId: string;
  invoiceNumber: string; // e.g. NI-2026-000001
  status: InvoiceStatus;
  templateId: InvoiceTemplateId;
  currency: string;
  issueDate: string;
  dueDate: string;
  purchaseOrder?: string;
  paymentTerms?: string;
  documentTitle: string; // "INVOICE", "TAX INVOICE", "BILL", etc.

  seller: {
    businessName: string;
    sellerName: string;
    email: string;
    phone: string;
    address: string;
    website?: string;
    taxNumber?: string;
    logoUrl?: string;
  };

  client: ClientDetails;

  lineItems: LineItem[];

  subtotal: number;
  discount: number; // invoice-level discount
  taxRate: number; // percentage, e.g. 10 for 10%
  taxAmount: number;
  extraCharges: number; // shipping or extra handling
  total: number;
  amountPaid: number;
  balanceDue: number;

  notes?: string;
  paymentInstructions?: string;
  termsAndConditions?: string;

  createdAt: string;
  updatedAt: string;
}

export interface DailyUsage {
  userId: string;
  dateKey: string; // YYYY-MM-DD
  invoicesCreated: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsersNow: number;
  activeUsers7Days: number;
  activeUsers30Days: number;
  newUsersToday: number;
  newUsers7Days: number;
  newUsers30Days: number;
  totalInvoices: number;
  invoicesToday: number;
  activePaidSubscribers: number;
  monthlyProSubscribers: number;
  annualProSubscribers: number;
  freePlanUsers: number;
  enterpriseAdminAccounts: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetUserId?: string;
  details: string;
  timestamp: string;
}
