import { LineItem } from '../types';

export const SUPPORTED_CURRENCIES: { [code: string]: { symbol: string; name: string } } = {
  USD: { symbol: '$', name: 'US Dollar (USD)' },
  EUR: { symbol: '€', name: 'Euro (EUR)' },
  GBP: { symbol: '£', name: 'British Pound (GBP)' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar (CAD)' },
  AUD: { symbol: 'A$', name: 'Australian Dollar (AUD)' },
  JPY: { symbol: '¥', name: 'Japanese Yen (JPY)' },
  INR: { symbol: '₹', name: 'Indian Rupee (INR)' },
  LKR: { symbol: 'Rs. ', name: 'Sri Lankan Rupee (LKR)' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar (SGD)' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc (CHF)' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar (NZD)' },
  AED: { symbol: 'AED', name: 'UAE Dirham (AED)' },
  BRL: { symbol: 'R$', name: 'Brazilian Real (BRL)' },
};

export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calculateLineTotal(quantity: number, unitPrice: number, discount = 0): number {
  const safeQty = Math.max(0, Number(quantity) || 0);
  const safePrice = Math.max(0, Number(unitPrice) || 0);
  const safeDiscount = Math.max(0, Number(discount) || 0);
  const gross = safeQty * safePrice;
  return roundToTwo(Math.max(0, gross - safeDiscount));
}

export function calculateInvoiceTotals(
  lineItems: LineItem[],
  invoiceDiscount = 0,
  taxRate = 0,
  extraCharges = 0,
  amountPaid = 0
) {
  const subtotal = roundToTwo(
    lineItems.reduce((acc, item) => acc + calculateLineTotal(item.quantity, item.unitPrice, item.discount), 0)
  );

  const safeDiscount = roundToTwo(Math.min(subtotal, Math.max(0, Number(invoiceDiscount) || 0)));
  const taxableSubtotal = roundToTwo(Math.max(0, subtotal - safeDiscount));
  const safeTaxRate = Math.max(0, Number(taxRate) || 0);
  const taxAmount = roundToTwo((taxableSubtotal * safeTaxRate) / 100);
  const safeExtra = roundToTwo(Math.max(0, Number(extraCharges) || 0));
  const total = roundToTwo(taxableSubtotal + taxAmount + safeExtra);
  const safePaid = roundToTwo(Math.max(0, Number(amountPaid) || 0));
  const balanceDue = roundToTwo(Math.max(0, total - safePaid));

  return {
    subtotal,
    discount: safeDiscount,
    taxableSubtotal,
    taxRate: safeTaxRate,
    taxAmount,
    extraCharges: safeExtra,
    total,
    amountPaid: safePaid,
    balanceDue,
  };
}

export function formatCurrency(amount: number, currencyCode = 'USD'): string {
  const num = Number(amount) || 0;
  const curr = SUPPORTED_CURRENCIES[currencyCode] || { symbol: currencyCode + ' ', name: currencyCode };
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${curr.symbol}${formatted}`;
}
