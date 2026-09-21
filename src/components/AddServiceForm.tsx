"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export type NewServiceInput = {
  name: string;
  description: string;
  unit: string;
  unitPrice: number;
  taxPct: number;
  remarks: string;
};

export function AddServiceForm({
  defaultTaxPct,
  onAdd,
}: {
  defaultTaxPct: number;
  onAdd: (item: NewServiceInput) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [taxPct, setTaxPct] = useState(String(defaultTaxPct));
  const [remarks, setRemarks] = useState("");

  const canAdd = name.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) return;
    onAdd({
      name: name.trim(),
      description: description.trim(),
      unit: unit.trim(),
      unitPrice: Number(price) || 0,
      taxPct: Number(taxPct) || 0,
      remarks: remarks.trim(),
    });
    setName("");
    setDescription("");
    setUnit("");
    setPrice("");
    setTaxPct(String(defaultTaxPct));
    setRemarks("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-3 text-sm font-semibold text-slate-500">
        ADD A SERVICE
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2 flex flex-col gap-1 text-xs text-slate-500">
          Service Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mobile App Development"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-800 focus:border-[#0B2050] focus:outline-none focus:ring-2 focus:ring-[#0B2050]/20"
          />
        </label>

        <label className="sm:col-span-2 flex flex-col gap-1 text-xs text-slate-500">
          Description (optional)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's included in this service"
            rows={2}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-[#0B2050] focus:outline-none focus:ring-2 focus:ring-[#0B2050]/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Price
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-[#0B2050] focus:outline-none focus:ring-2 focus:ring-[#0B2050]/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Unit (optional)
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="/ month, one-time..."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-[#0B2050] focus:outline-none focus:ring-2 focus:ring-[#0B2050]/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Tax %
          <input
            type="number"
            value={taxPct}
            onChange={(e) => setTaxPct(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-[#0B2050] focus:outline-none focus:ring-2 focus:ring-[#0B2050]/20"
          />
        </label>

        <label className="sm:col-span-2 flex flex-col gap-1 text-xs text-slate-500">
          Remarks (optional)
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Shown next to this service on the quotation"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-[#0B2050] focus:outline-none focus:ring-2 focus:ring-[#0B2050]/20"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={!canAdd}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0B2050] px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40 sm:w-auto"
      >
        <Plus size={15} /> Add to Quote
      </button>
    </form>
  );
}
