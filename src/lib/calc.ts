import { QuoteDiscount, QuoteItem } from "./types";

export type ItemBreakdown = {
  lineId: string;
  /** price before GST */
  base: number;
  taxAmt: number;
  /** price + GST, rounded to whole rupees so the column adds up to the subtotal */
  total: number;
};

export type QuoteTotals = {
  items: ItemBreakdown[];
  /** sum of the line totals (price + GST) */
  subtotal: number;
  /** discount given on the subtotal */
  totalDiscount: number;
  grandTotal: number;
};

/** Discounts are given on the subtotal only, never per line. Each line's
 *  total is its price + GST. */
export function computeTotals(
  items: QuoteItem[],
  quoteDiscount: QuoteDiscount
): QuoteTotals {
  const breakdown: ItemBreakdown[] = items.map((item) => {
    const base = item.unitPrice;
    const taxAmt = base * (item.taxPct / 100);
    return {
      lineId: item.lineId,
      base,
      taxAmt,
      total: Math.round(base + taxAmt),
    };
  });

  const subtotal = breakdown.reduce((sum, b) => sum + b.total, 0);

  const totalDiscount =
    subtotal <= 0
      ? 0
      : quoteDiscount.type === "percent"
        ? Math.round(subtotal * (quoteDiscount.value / 100))
        : Math.min(Math.round(quoteDiscount.value), subtotal);

  return {
    items: breakdown,
    subtotal,
    totalDiscount,
    grandTotal: subtotal - totalDiscount,
  };
}

export function formatCurrency(n: number): string {
  const rounded = Math.round(n);
  return `₹${rounded.toLocaleString("en-IN")}`;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
