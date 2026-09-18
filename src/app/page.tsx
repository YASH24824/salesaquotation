"use client";

import { useMemo, useState } from "react";
import { FileText, RotateCcw } from "lucide-react";
import catalogRaw from "@/data/catalog.json";
import {
  CatalogData,
  Customer,
  FullQuote,
  QuoteDiscount,
  QuoteItem,
  Salesperson,
} from "@/lib/types";
import { addDays, computeTotals, formatDate } from "@/lib/calc";
import { generateLineId, generateQuoteNumber } from "@/lib/quoteNumber";
import { saveQuoteForPreview, PREVIEW_TAB_NAME } from "@/lib/previewStorage";
import { CustomerForm } from "@/components/CustomerForm";
import { SalespersonForm } from "@/components/SalespersonForm";
import { AddServiceForm, NewServiceInput } from "@/components/AddServiceForm";
import { QuoteCart } from "@/components/QuoteCart";
import { TotalsPanel } from "@/components/TotalsPanel";
import { StickyActionBar } from "@/components/StickyActionBar";

const catalog = catalogRaw as CatalogData;

const emptyCustomer: Customer = {
  name: "",
  phone: "",
  email: "",
  companyName: "",
  address: "",
  clientName: "",
};

const emptySalesperson: Salesperson = {
  name: "",
  email: "",
  phone: "",
};

export default function Home() {
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [salesperson, setSalesperson] = useState<Salesperson>(emptySalesperson);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [quoteDiscount, setQuoteDiscount] = useState<QuoteDiscount>({
    type: "percent",
    value: 0,
  });
  const [validityDays, setValidityDays] = useState(
    catalog.company.defaultValidityDays
  );
  const [notes, setNotes] = useState("");

  const totals = useMemo(
    () => computeTotals(items, quoteDiscount),
    [items, quoteDiscount]
  );

  function handleAdd(input: NewServiceInput) {
    const newItem: QuoteItem = {
      lineId: generateLineId(),
      name: input.name,
      description: input.description,
      unit: input.unit,
      unitPrice: input.unitPrice,
      quantity: input.quantity,
      discountPct: 0,
      taxPct: input.taxPct,
    };
    setItems((prev) => [...prev, newItem]);
  }

  function handleUpdate(lineId: string, patch: Partial<QuoteItem>) {
    setItems((prev) =>
      prev.map((i) => (i.lineId === lineId ? { ...i, ...patch } : i))
    );
  }

  function handleRemove(lineId: string) {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }

  const canGenerate =
    items.length > 0 &&
    customer.name.trim().length > 0 &&
    customer.phone.trim().length > 0;

  function disabledReason() {
    if (items.length === 0) return "Add at least one service to continue";
    if (!customer.name.trim() || !customer.phone.trim())
      return "Enter customer name & phone to continue";
    return undefined;
  }

  function handleGenerate() {
    const now = new Date();
    const quote: FullQuote = {
      company: catalog.company,
      customer,
      salesperson,
      items,
      quoteDiscount,
      notes,
      meta: {
        quoteNumber: generateQuoteNumber(catalog.company.quoteNumberPrefix),
        issueDate: formatDate(now),
        expiryDate: formatDate(addDays(now, validityDays)),
      },
    };
    saveQuoteForPreview(quote);
    // Named target: re-clicking Generate reuses the same preview tab instead
    // of piling up new ones, and the query string forces it to reload and
    // pick up the latest edits from this tab.
    window.open(`/preview?t=${Date.now()}`, PREVIEW_TAB_NAME);
  }

  function handleNewQuote() {
    setCustomer(emptyCustomer);
    setSalesperson(emptySalesperson);
    setItems([]);
    setQuoteDiscount({ type: "percent", value: 0 });
    setValidityDays(catalog.company.defaultValidityDays);
    setNotes("");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: catalog.company.brandPrimaryColor }}
            >
              <FileText size={18} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-slate-900">
                {catalog.company.name}
              </p>
              <p className="text-xs leading-tight text-slate-400">
                Quick Quote
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleNewQuote}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <RotateCcw size={15} /> New quote
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <CustomerForm customer={customer} onChange={setCustomer} />
            <SalespersonForm
              salesperson={salesperson}
              onChange={setSalesperson}
            />
            <AddServiceForm defaultTaxPct={18} onAdd={handleAdd} />
            <QuoteCart
              items={items}
              breakdown={totals.items}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
            />
          </div>
          <div className="lg:col-span-1">
            <TotalsPanel
              totals={totals}
              quoteDiscount={quoteDiscount}
              onQuoteDiscountChange={setQuoteDiscount}
              validityDays={validityDays}
              onValidityDaysChange={setValidityDays}
              notes={notes}
              onNotesChange={setNotes}
            />
          </div>
        </div>
      </main>

      <StickyActionBar
        grandTotal={totals.grandTotal}
        itemCount={items.length}
        disabled={!canGenerate}
        disabledReason={disabledReason()}
        onGenerate={handleGenerate}
      />
    </div>
  );
}
