import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { aiSearch } from "../../api/ai";
import type { AiSearchResult } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";

const TYPE_PATH: Record<string, string> = {
  customer: "/customers/",
  supplier: "/suppliers/",
  invoice: "/invoices/",
  bill: "/purchasing/bills/",
  product: "/inventory/",
  shipment: "/logistics/shipments/",
};

export function AiSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AiSearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiSearch(query.trim());
      setResults(res.results);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link to="/ai" className="text-sm text-navy-800 hover:underline">
        ← AI tools
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">Search</h1>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2 max-w-lg">
        <Input
          placeholder="Search across customers, invoices, bills, products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </Button>
      </form>

      {error && <p className="text-sm text-negative">{error}</p>}

      {results && (
        <Card>
          {results.length === 0 ? (
            <p className="p-6 text-sm text-ink-muted">No results.</p>
          ) : (
            <ul>
              {results.map((r, i) => {
                const path = TYPE_PATH[r.type];
                const content = (
                  <div className="px-5 py-3 border-b border-border last:border-0 hover:bg-navy-50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink">{r.label}</span>
                      <span className="text-xs text-ink-muted capitalize">{r.type}</span>
                    </div>
                    {r.subtitle && <div className="text-xs text-ink-muted mt-0.5">{r.subtitle}</div>}
                  </div>
                );
                return (
                  <li key={i}>
                    {path ? <Link to={`${path}${r.id}`}>{content}</Link> : content}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
