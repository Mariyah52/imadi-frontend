import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { globalSearch, type GlobalSearchItem } from "../api/search";

const TYPE_ICONS: Record<string, string> = {
  customer: "C",
  contact: "C",
  supplier: "S",
  product: "P",
  category: "C",
  warehouse: "W",
  invoice: "I",
  credit_note: "CN",
  purchase_order: "PO",
  bill: "B",
  purchase_return: "PR",
  driver: "D",
  vehicle: "V",
  pickup: "PU",
  delivery: "DO",
  shipment: "SH",
  route: "R",
  account: "A",
  journal_entry: "JE",
  bank_account: "BA",
  bank_transaction: "BT",
  bank_transfer: "TR",
  payment: "PAY",
  user: "U",
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<GlobalSearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const results = await globalSearch(trimmed, controller.signal);
        setItems(results);
        setActiveIndex(0);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setItems([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 120);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const openItem = (item: GlobalSearchItem) => {
    setOpen(false);
    setQuery("");
    navigate(item.href);
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && items.length) {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, items.length - 1));
    } else if (event.key === "ArrowUp" && items.length) {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && items[activeIndex]) {
      event.preventDefault();
      openItem(items[activeIndex]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-bg px-3 shadow-sm transition focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-ink-muted" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          placeholder="Search anything…"
          aria-label="Search anything in IMADI ERP"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
        />
        {loading ? (
          <span className="text-xs text-ink-muted">Searching…</span>
        ) : (
          <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-muted sm:inline-block">Ctrl K</kbd>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          {items.length > 0 ? (
            <div className="max-h-[min(28rem,70vh)] overflow-y-auto py-1">
              {items.map((item, index) => (
                <button
                  type="button"
                  key={`${item.type}-${item.id}-${index}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => openItem(item)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${index === activeIndex ? "bg-amber-100/60" : "hover:bg-bg"}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy-900 text-[10px] font-bold text-white">
                    {TYPE_ICONS[item.type] ?? "•"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{item.title ?? "Untitled"}</span>
                    <span className="block truncate text-xs text-ink-muted">{item.label}{item.subtitle ? ` · ${item.subtitle}` : ""}</span>
                  </span>
                  <span className="text-xs text-ink-muted">Open</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-5 text-center text-sm text-ink-muted">
              {loading ? "Searching your ERP…" : "No matching records found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
