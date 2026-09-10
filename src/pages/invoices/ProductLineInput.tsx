import { useEffect, useRef, useState } from "react";
import { listProducts } from "../../api/inventory";
import type { Product } from "../../types/api";
import { Input } from "../../components/ui/Field";

/**
 * A description field that doubles as a product search. Typing shows
 * matching products from Inventory (by SKU or name); picking one fills
 * in the description and pre-fills the unit price with the product's
 * selling price. You can still type free text if nothing matches —
 * this never blocks typing a plain description.
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!value.trim() || value.trim().length < 2) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      listProducts(value.trim(), undefined, 1, 6)
        .then((res) => setResults(res.items))
        .catch(() => setResults([]));
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

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
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-white shadow-md max-h-56 overflow-y-auto">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-navy-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelectProduct(p);
                  setResults([]);
                  setOpen(false);
                }}
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
