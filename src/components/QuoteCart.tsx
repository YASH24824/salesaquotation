"use client";

import { Trash2, ShoppingCart } from "lucide-react";
import { QuoteItem } from "@/lib/types";
import { ItemBreakdown } from "@/lib/calc";
import { formatCurrency } from "@/lib/calc";

export function QuoteCart({
  items,
  breakdown,
  onUpdate,
  onRemove,
}: {
  items: QuoteItem[];
  breakdown: ItemBreakdown[];
  onUpdate: (lineId: string, patch: Partial<QuoteItem>) => void;
  onRemove: (lineId: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
        <ShoppingCart size={28} className="mb-2 text-slate-300" />
        <p className="text-sm">
          Add a service above to include it in this quote.
        </p>
      </div>
    );
  }

  const byId = new Map(breakdown.map((b) => [b.lineId, b]));

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-500">
        THIS QUOTATION ({items.length})
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const line = byId.get(item.lineId);
          return (
            <div key={item.lineId} className="flex flex-col gap-2.5 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    onUpdate(item.lineId, { name: e.target.value })
                  }
                  placeholder="Enter service name"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B2050]/20"
                />
                <button
                  type="button"
                  onClick={() => onRemove(item.lineId)}
                  className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-400">
                  Price
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      onUpdate(item.lineId, {
                        unitPrice: Number(e.target.value) || 0,
                      })
                    }
                    className={`w-24 rounded-md border px-2 py-1 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B2050]/20 ${
                      item.unitPrice === 0
                        ? "border-amber-400 bg-amber-50"
                        : "border-slate-300"
                    }`}
                  />
                </label>

                <span className="ml-auto text-right">
                  <span className="block text-sm font-bold text-slate-900">
                    {formatCurrency(line?.total ?? 0)}
                  </span>
                  <span className="block text-[11px] leading-tight text-slate-400">
                    incl. {item.taxPct}% GST
                  </span>
                </span>
              </div>

              <label className="flex items-center gap-1.5 text-xs text-slate-400">
                Remarks
                <input
                  type="text"
                  value={item.remarks ?? ""}
                  onChange={(e) =>
                    onUpdate(item.lineId, { remarks: e.target.value })
                  }
                  placeholder="Shown next to this service on the quotation"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B2050]/20"
                />
              </label>

              {item.unitPrice === 0 && (
                <p className="text-xs font-medium text-amber-600">
                  Set a price for this item before generating the quote.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
