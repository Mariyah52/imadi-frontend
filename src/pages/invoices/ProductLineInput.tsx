import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { listProducts } from "../../api/inventory";
import type { Product } from "../../types/api";
import { Input } from "../../components/ui/Field";

/**
 * A description field that doubles as a product search. Typing shows
 * matching products from Inventory (by SKU or name); picking one fills
 * in the description and pre-fills the unit price with the product's
 * selling price. You can still type free text if nothing matches —
 * this never blocks typing a plain description.
 *
 * While the dropdown is open: ArrowDown/ArrowUp move the highlighted
 * result, Enter picks the highlighted one, Escape closes the dropdown.
 */
export function ProductLineInput({
  value,
  onChange,
  onSelectProduct,
}: {
  value: string;
  onChange: (description: string) => void;
  onSelectProduct: (product: Product) => void;
}) {
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!value.trim() || value.trim().length < 2) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      listProducts(value.trim(), undefined, 1, 6)
        .then((res) => {
          setResults(res.items);
          setActiveIndex(0);
        })
        .catch(() => setResults([]));
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  function pick(product: Product) {
    onSelectProduct(product);
    setResults([]);
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      // Only take over Enter when there's a highlighted match — otherwise
      // let it behave normally (e.g. a free-text description with no
      // matching product shouldn't have Enter swallowed).
      event.preventDefault();
      pick(results[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <Input
        required
        placeholder="Type to search products, or type a free description…"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-white shadow-md max-h-56 overflow-y-auto">
          {results.map((p, index) => (
            <li key={p.id}>
              <button
                type="button"
                className={`block w-full px-3 py-2 text-left text-sm ${
                  index === activeIndex ? "bg-navy-50" : "hover:bg-navy-50"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(p)}
              >
                <span className="font-mono-data text-xs text-ink-muted">{p.sku}</span>{" "}
                <span className="font-medium">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
