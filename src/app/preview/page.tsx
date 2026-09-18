"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { FullQuote } from "@/lib/types";
import { loadQuoteForPreview } from "@/lib/previewStorage";
import { QuotePreview } from "@/components/QuotePreview";
import { PreviewActions } from "@/components/PreviewActions";

export default function PreviewPage() {
  const [quote, setQuote] = useState<FullQuote | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setQuote(loadQuoteForPreview());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (!quote) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-slate-100 px-4 text-center">
        <FileText size={28} className="text-slate-300" />
        <p className="max-w-sm text-sm text-slate-500">
          No quotation to preview yet. Go back to the quotation tab, fill in
          the details and click <span className="font-semibold">Generate Quotation</span>.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-6">
      <QuotePreview quote={quote} />
      <PreviewActions quote={quote} />
    </main>
  );
}
