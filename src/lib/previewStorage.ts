import { FullQuote } from "./types";

const STORAGE_KEY = "digital-quote-preview";
export const PREVIEW_TAB_NAME = "quote-preview-tab";

export function saveQuoteForPreview(quote: FullQuote) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quote));
}

export function loadQuoteForPreview(): FullQuote | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FullQuote) : null;
  } catch {
    return null;
  }
}
