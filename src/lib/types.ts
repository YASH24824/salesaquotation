export type Stat = {
  /** the big figure, e.g. "50+" */
  value: string;
  label: string;
  caption: string;
  /** makes the card a clickable link in the PDF and preview */
  href?: string;
};

export type CompanyStats = {
  employees: Stat;
  googleReviews: Stat;
  award: Stat;
};

export type Company = {
  name: string;
  /** full registered name shown under COMPANY DETAILS; falls back to `name` */
  legalName?: string;
  /** optional so quotes saved before stats existed still open */
  stats?: CompanyStats;
  tagline: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  brandPrimaryColor: string;
  brandAccentColor: string;
  quoteNumberPrefix: string;
  defaultValidityDays: number;
  bankName: string;
  accountName: string;
  accountNo: string;
  ifsc: string;
  swift: string;
  branch: string;
};

export type CatalogData = {
  company: Company;
};

export type Customer = {
  name: string;
  phone: string;
  email: string;
  companyName: string;
  address: string;
  clientName: string;
};

export type Salesperson = {
  name: string;
  email: string;
  phone: string;
};

export type QuoteItem = {
  lineId: string;
  name: string;
  description: string;
  unit: string;
  unitPrice: number;
  taxPct: number;
  remarks: string;
};

export type QuoteDiscount = {
  type: "percent" | "flat";
  value: number;
};

export type QuoteMeta = {
  quoteNumber: string;
  issueDate: string;
  expiryDate: string;
};

export type FullQuote = {
  company: Company;
  customer: Customer;
  salesperson: Salesperson;
  items: QuoteItem[];
  quoteDiscount: QuoteDiscount;
  meta: QuoteMeta;
  notes: string;
};
