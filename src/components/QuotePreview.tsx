"use client";

import { FullQuote } from "@/lib/types";
import { computeTotals, formatCurrency } from "@/lib/calc";
import { useLogoAvailable } from "@/lib/useLogoAvailable";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Globe,
  Hourglass,
  Mail,
  MapPin,
  Megaphone,
  MonitorSmartphone,
  Package,
  PenTool,
  Phone,
  Search,
  Share2,
  ShoppingCart,
  User,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const NAVY = "#0C2A5E";
const ACCENT = "#1E74D4";

function withAlpha(hex: string | undefined, alpha: number) {
  const h = (hex ?? "").replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  if (full.length !== 6) return `rgba(30, 116, 212, ${alpha})`;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** The data has no icon field, so pick one from the service name. */
function serviceIcon(name: string): LucideIcon {
  const n = (name || "").toLowerCase();
  if (/\bseo\b|search engine|keyword|ranking/.test(n)) return Search;
  if (/website|web dev|landing|page|app|development/.test(n)) return MonitorSmartphone;
  if (/social|instagram|facebook|smm/.test(n)) return Share2;
  if (/ads?|advertis|ppc|google ad|meta ad|campaign|marketing/.test(n)) return Megaphone;
  if (/design|brand|logo|creative|graphic/.test(n)) return PenTool;
  if (/content|blog|copy|writing|article/.test(n)) return FileText;
  if (/ecommerce|e-commerce|shop|store|catalog/.test(n)) return ShoppingCart;
  return Package;
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

export function QuotePreview({
  quote,
  headerTagline = "Business Consultancy",
  whyChooseUsHeading = "Why Choose Us?",
  trustedPartnerLine = "Your Business's Trusted Partner",
  growLine = "NEXT-GEN BUSINESS CONSULTANCY, Let's Grow India Together",
  expertiseLine = "Where your vision meets our expertise.",
}: {
  quote: FullQuote;
  headerTagline?: string;
  whyChooseUsHeading?: string;
  trustedPartnerLine?: string;
  growLine?: string;
  expertiseLine?: string;
}) {
  const { company, customer, salesperson, items, meta, notes, quoteDiscount } = quote;
  const totals = computeTotals(items, quoteDiscount);
  const logoOk = useLogoAvailable(company.logo);
  const byId = new Map(totals.items.map((b) => [b.lineId, b]));

  const navy = company.brandPrimaryColor || NAVY;
  const accent = company.brandAccentColor || ACCENT;
  const iconBg = withAlpha(accent, 0.1);

  return (
    <div
      id="quote-preview-doc"
      className="relative mx-auto w-full max-w-[860px] bg-white text-slate-800 shadow-xl"
    >
      {/* ---------- decorative frame ---------- */}
      <div className="pointer-events-none absolute inset-[7px] border" style={{ borderColor: withAlpha(navy, 0.35) }} />
      <div className="pointer-events-none absolute inset-[13px] border" style={{ borderColor: withAlpha(navy, 0.55) }} />
      {(
        [
          "left-[7px] top-[7px] border-l-[3px] border-t-[3px]",
          "right-[7px] top-[7px] border-r-[3px] border-t-[3px]",
          "bottom-[7px] left-[7px] border-b-[3px] border-l-[3px]",
          "bottom-[7px] right-[7px] border-b-[3px] border-r-[3px]",
        ] as const
      ).map((pos) => (
        <span
          key={pos}
          className={`pointer-events-none absolute h-9 w-9 ${pos}`}
          style={{ borderColor: navy }}
        />
      ))}

      <div className="relative px-[19px] pb-[19px] pt-[15px]">
        {/* ================= HEADER ================= */}
        <header className="relative h-[172px]">
          <svg
            viewBox="0 0 820 172"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            {/* blue swoosh underlay */}
            <path d="M352 0 L820 0 L820 148 L316 168 Z" fill={accent} />
            {/* white separator */}
            <path d="M362 0 L820 0 L820 134 L326 154 Z" fill="#ffffff" />
            {/* navy block */}
            <path d="M372 0 L820 0 L820 120 L336 140 Z" fill={navy} />
          </svg>

          <div className="absolute inset-0 flex items-start">
            {/* brand lockup */}
            <div className="flex w-[44%] items-center gap-3 pl-6 pt-9">
              {logoOk ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logo} alt="" className="h-[74px] w-auto object-contain" />
              ) : (
                <div>
                  <p className="text-2xl font-extrabold leading-tight" style={{ color: navy }}>
                    {company.name}
                  </p>
                  {company.website && (
                    <p className="text-xs font-semibold" style={{ color: accent }}>
                      {company.website}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* QUOTATION plate */}
            <div className="flex-1 pr-8 pt-8 text-center text-white">
              <h1 className="font-serif text-[46px] font-normal leading-none tracking-[0.055em]">
                QUOTATION
              </h1>
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="h-px w-12" style={{ backgroundColor: withAlpha(accent, 0.9) }} />
                <span className="text-[11px] uppercase tracking-[0.28em] text-white/90">
                  {headerTagline}
                </span>
                <span className="h-px w-12" style={{ backgroundColor: withAlpha(accent, 0.9) }} />
              </div>
            </div>
          </div>
        </header>

        {/* ================= META STRIP ================= */}
        <section className="grid grid-cols-[1fr_1.1fr_1fr] border-b border-slate-200 px-3 pb-6 pt-5 text-[13px]">
          {/* quotation for */}
          <div className="pr-6">
            <div className="flex items-center gap-3">
              <CircleIcon color={navy}>
                <User size={17} strokeWidth={2.2} />
              </CircleIcon>
              <p className="text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: accent }}>
                Quotation For
              </p>
            </div>
            <div className="pl-[52px] pt-2">
              {customer.clientName && (
                <p className="text-[21px] font-extrabold leading-tight text-slate-900">
                  {customer.clientName}
                </p>
              )}
              <p
                className={
                  customer.clientName
                    ? "mt-1 text-slate-600"
                    : "text-[21px] font-extrabold leading-tight text-slate-900"
                }
              >
                {customer.name || "—"}
              </p>
              {customer.companyName && <p className="text-slate-600">{customer.companyName}</p>}
              {customer.phone && (
                <p className="mt-1.5 flex items-center gap-2 text-slate-700">
                  <Phone size={14} style={{ color: accent }} />
                  {customer.phone}
                </p>
              )}
              {customer.email && (
                <p className="mt-1 flex items-center gap-2 text-slate-700">
                  <Mail size={14} style={{ color: accent }} />
                  {customer.email}
                </p>
              )}
              {customer.address && (
                <p className="mt-1 whitespace-pre-line text-slate-500">{customer.address}</p>
              )}
            </div>
          </div>

          {/* quote meta */}
          <div className="border-x border-slate-200 px-7">
            <MetaRow icon={ClipboardList} accent={accent} bg={iconBg} label="Quote #" value={meta.quoteNumber} />
            <MetaRow icon={CalendarDays} accent={accent} bg={iconBg} label="Date" value={meta.issueDate} />
            <MetaRow
              icon={Hourglass}
              accent={accent}
              bg={iconBg}
              label="Valid Until"
              value={meta.expiryDate}
              last={!company.gstin}
            />
            {company.gstin && (
              <MetaRow icon={FileText} accent={accent} bg={iconBg} label="GSTIN" value={company.gstin} last />
            )}
          </div>

          {/* prepared by */}
          <div className="pl-7">
            <div className="flex items-center gap-3">
              <CircleIcon color={navy}>
                <User size={17} strokeWidth={2.2} />
              </CircleIcon>
              <p className="text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: accent }}>
                Prepared By
              </p>
            </div>
            <div className="pl-[52px] pt-2">
              <p className="text-[19px] font-extrabold leading-tight text-slate-900">
                {salesperson.name || "—"}
              </p>
              {salesperson.phone && (
                <p className="mt-2 flex items-center gap-2 text-slate-700">
                  <Phone size={14} style={{ color: accent }} />
                  {salesperson.phone}
                </p>
              )}
              {salesperson.email && (
                <p className="mt-1 flex items-center gap-2 text-slate-700">
                  <Mail size={14} style={{ color: accent }} />
                  {salesperson.email}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ================= ITEMS ================= */}
        <table className="mt-5 w-full table-fixed border-collapse text-[13px]">
          <colgroup>
            <col className="w-[45%]" />
            <col className="w-[12%]" />
            <col className="w-[15%]" />
            <col className="w-[13%]" />
            <col className="w-[15%]" />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: navy }}>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-white">
                Service
              </th>
              <th className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.13em] text-white">
                Qty
              </th>
              <th className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.13em] text-white">
                Price
              </th>
              <th className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.13em] text-white">
                Disc.
              </th>
              <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.13em] text-white">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const line = byId.get(item.lineId);
              const Icon = serviceIcon(item.name);
              return (
                <tr key={item.lineId} className="border-b border-slate-200">
                  <td className="px-5 py-4 align-top">
                    <div className="flex gap-3.5">
                      <span
                        className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: iconBg, color: navy }}
                      >
                        <Icon size={20} strokeWidth={2} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold leading-snug" style={{ color: navy }}>
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="mt-1 whitespace-pre-line text-[12.5px] leading-[1.65] text-slate-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="border-l border-slate-200 px-2 py-4 text-center align-middle font-semibold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="border-l border-slate-200 px-2 py-4 text-center align-middle font-semibold text-slate-800">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="border-l border-slate-200 px-2 py-4 text-center align-middle text-slate-500">
                    {item.discountPct > 0 ? `${item.discountPct}%` : "—"}
                  </td>
                  <td
                    className="border-l border-slate-200 px-3 py-4 text-center align-middle text-[15px] font-extrabold"
                    style={{ color: accent }}
                  >
                    {formatCurrency(line?.total ?? 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ================= NOTES + TOTALS ================= */}
        <section className="flex items-stretch">
          <div className="w-[45%] px-5 py-5">
            {notes && (
              <>
                <p
                  className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: accent }}
                >
                  Notes
                </p>
                <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-slate-600">
                  {notes}
                </p>
              </>
            )}
          </div>

          <div className="w-[55%] border-l border-slate-200">
            <TotalRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
            {totals.lineDiscountTotal > 0 && (
              <TotalRow
                label="Line Discounts"
                value={`- ${formatCurrency(totals.lineDiscountTotal)}`}
                negative
              />
            )}
            {totals.quoteDiscountAmt > 0 && (
              <TotalRow
                label="Quote Discount"
                value={`- ${formatCurrency(totals.quoteDiscountAmt)}`}
                negative
              />
            )}
            <TotalRow label="Tax (GST)" value={formatCurrency(totals.taxTotal)} />

            {/* grand total bar */}
            <div className="relative h-[56px]">
              <svg
                viewBox="0 0 420 56"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
                aria-hidden
              >
                <rect width="420" height="56" fill={navy} />
                <path d="M228 0 L420 0 L420 56 L204 56 Z" fill={accent} />
                <path d="M226 0 L236 0 L212 56 L202 56 Z" fill="#ffffff" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-between px-5 text-white">
                <span className="text-[17px] font-semibold uppercase tracking-[0.06em]">
                  Grand Total
                </span>
                <span className="text-[24px] font-extrabold">
                  {formatCurrency(totals.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= WHY CHOOSE US + BANK DETAILS ================= */}
        <section className="mt-7 grid grid-cols-[1.35fr_1fr] gap-8 px-5">
          <div>
            <p
              className="text-[12.5px] font-bold uppercase tracking-[0.08em]"
              style={{ color: accent }}
            >
              {whyChooseUsHeading}
            </p>
            <span className="mt-1.5 block h-[2px] w-8" style={{ backgroundColor: accent }} />
            <p className="mt-3 text-[15px] font-bold leading-snug text-slate-800">
              {trustedPartnerLine}
            </p>
            <p className="mt-2 text-[13.5px] font-extrabold leading-snug" style={{ color: navy }}>
              {growLine}
            </p>
            <p className="mt-2 text-[12.5px] italic leading-relaxed text-slate-500">
              {expertiseLine}
            </p>
          </div>

          <div className="border-l border-slate-200 pl-8">
            <p
              className="text-[12px] font-bold uppercase tracking-[0.08em]"
              style={{ color: accent }}
            >
              Bank Details
            </p>
            <div className="mt-3 rounded-lg border border-slate-200 px-4 py-3">
              <BankRow label="Bank Name" value={company.bankName} />
              <BankRow label="Account Name" value={company.accountName} />
              <BankRow label="Account No." value={company.accountNo} />
              <BankRow label="IFSC" value={company.ifsc} />
              <BankRow label="SWIFT Code" value={company.swift} />
              <BankRow label="Branch" value={company.branch} last />
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="relative mt-7 overflow-hidden rounded-b-sm" style={{ backgroundColor: navy }}>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3.5 text-white">
            {company.address && (
              <FooterItem icon={MapPin} text={company.address} wrap />
            )}
            {company.email && <FooterItem  icon={Mail} text={company.email} />}
            {company.website && <FooterItem icon={Globe} text={company.website} />}
          </div>
          <div className="h-[3px]" style={{ backgroundColor: accent }} />
        </footer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* small pieces                                                        */
/* ------------------------------------------------------------------ */

function CircleIcon({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
}

function BankRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-2 text-[12px] ${
        last ? "" : "border-b border-dashed border-slate-200"
      }`}
    >
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  accent,
  bg,
  label,
  value,
  last,
}: {
  icon: LucideIcon;
  accent: string;
  bg: string;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 py-3 ${
        last ? "" : "border-b border-dashed border-slate-300"
      }`}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: bg, color: accent }}
      >
        <Icon size={15} strokeWidth={2} />
      </span>
      <span className="w-[86px] shrink-0 font-bold text-slate-800">{label}</span>
      <span className="truncate text-slate-600">{value}</span>
    </div>
  );
}

function TotalRow({
  label,
  value,
  negative,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 text-[13px]">
      <span className="text-slate-700">{label}</span>
      <span className={negative ? "font-bold text-red-600" : "font-bold text-slate-900"}>
        {value}
      </span>
    </div>
  );
}

function FooterItem({
  icon: Icon,
  text,
  wrap,
}: {
  icon: LucideIcon;
  text: string;
  /** allow the label to wrap onto a second line (used for the address) */
  wrap?: boolean;
}) {
  return (
    <span
      className={`flex items-start gap-2 ${wrap ? "max-w-[300px]" : "whitespace-nowrap"}`}
    >
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/55">
        <Icon size={11} />
      </span>
      <span className="text-[11px] leading-snug">{text}</span>
    </span>
  );
}