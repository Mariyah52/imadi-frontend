import { useEffect, useRef, useState } from "react";
import { listSuppliers } from "../../api/suppliers";
import type { Supplier } from "../../types/api";
import { Input } from "../../components/ui/Field";

export function SupplierPicker({
  value,
  onChange,
}: {
  value: Supplier | null;
  onChange: (supplier: Supplier) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Supplier[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      listSuppliers(query, 1, 8)
        .then((res) => setResults(res.items))
        .catch(() => setResults([]));
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="relative">
      <Input
        placeholder="Search suppliers…"
        value={value ? value.company_name : query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-white shadow-md max-h-56 overflow-y-auto">
          {results.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-navy-50"
                onClick={() => {
                  onChange(s);
                  setQuery("");
                  setResults([]);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{s.company_name}</span>{" "}
                <span className="text-ink-muted text-xs font-mono-data">{s.supplier_code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
