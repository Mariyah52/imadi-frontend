import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getDuplicateBills, getDuplicateInvoices } from "../../api/ai";
import type { DuplicateBillPair, DuplicateInvoicePair } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { formatMoney } from "../../lib/format";

export function DuplicatesPage() {
  const [bills, setBills] = useState<DuplicateBillPair[] | null>(null);
  const [invoices, setInvoices] = useState<DuplicateInvoicePair[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDuplicateBills(), getDuplicateInvoices()])
      .then(([b, i]) => {
        setBills(b);
        setInvoices(i);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't check for duplicates."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Link to="/ai" className="text-sm text-navy-800 hover:underline">
        ← AI tools
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">Duplicate detection</h1>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {!loading && !error && (
        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">Possible duplicate bills</h2>
            {!bills || bills.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-ink-muted">None found.</p>
            ) : (
              <ul className="px-5 pb-5 flex flex-col gap-2">
                {bills.map((p, i) => (
                  <li key={i} className="text-sm border-b border-border pb-2 last:border-0">
                    <div className="flex justify-between">
                      <span className="font-mono-data text-xs">
                        {p.bill_a_number} ↔ {p.bill_b_number}
                      </span>
                      <span className="font-mono-data">
                        {formatMoney(p.amount_a)} / {formatMoney(p.amount_b)}
                      </span>
                    </div>
                    <div className="text-xs text-ink-muted">
                      {p.days_apart} days apart · {p.reason}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">
              Possible duplicate invoices
            </h2>
            {!invoices || invoices.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-ink-muted">None found.</p>
            ) : (
              <ul className="px-5 pb-5 flex flex-col gap-2">
                {invoices.map((p, i) => (
                  <li key={i} className="text-sm border-b border-border pb-2 last:border-0">
                    <div className="flex justify-between">
                      <span className="font-mono-data text-xs">
                        {p.invoice_a_number} ↔ {p.invoice_b_number}
                      </span>
                      <span className="font-mono-data">
                        {formatMoney(p.amount_a)} / {formatMoney(p.amount_b)}
                      </span>
                    </div>
                    <div className="text-xs text-ink-muted">
                      {p.days_apart} days apart · {p.reason}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
