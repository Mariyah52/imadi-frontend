import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getStockValuationReport } from "../../api/reports";
import type { StockValuationReport } from "../../api/reports";
import { Card } from "../../components/ui/Card";
import { formatMoney } from "../../lib/format";

export function StockValuationReportPage() {
  const [report, setReport] = useState<StockValuationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStockValuationReport()
      .then(setReport)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the report."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Link to="/reports" className="text-sm text-navy-800 hover:underline">
        ← Reports
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-1">Stock valuation</h1>
      {report && <p className="text-sm text-ink-muted mb-6">As of {report.as_of}</p>}

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {!loading && !error && report && (
        <>
          <Card className="p-5 mb-6 max-w-xs">
            <span className="text-sm text-ink-muted">Total value</span>
            <div className="mt-1 font-display text-xl font-semibold">
              {formatMoney(report.total_value)}
            </div>
          </Card>
          <Card>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Batch</th>
                  <th className="px-5 py-3 font-medium text-right">Qty</th>
                  <th className="px-5 py-3 font-medium text-right">Unit cost</th>
                  <th className="px-5 py-3 font-medium text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {report.lines.map((l, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-mono-data text-xs">{l.sku}</td>
                    <td className="px-5 py-3">{l.name}</td>
                    <td className="px-5 py-3 font-mono-data text-xs">{l.batch_number}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{l.quantity_on_hand}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{formatMoney(l.unit_cost)}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{formatMoney(l.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
