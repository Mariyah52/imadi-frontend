import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getVatSummary, validateVatNumber } from "../../api/vat";
import type { VatNumberValidateResponse, VatSummary } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { formatMoney } from "../../lib/format";
import { currentQuarter } from "../../lib/format";

export function VatSummaryPage() {
  const q = currentQuarter();
  const [periodStart, setPeriodStart] = useState(q.start);
  const [periodEnd, setPeriodEnd] = useState(q.end);
  const [summary, setSummary] = useState<VatSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vatNumberInput, setVatNumberInput] = useState("");
  const [validation, setValidation] = useState<VatNumberValidateResponse | null>(null);
  const [validating, setValidating] = useState(false);

  function load() {
    setLoading(true);
    getVatSummary(periodStart, periodEnd)
      .then(setSummary)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load VAT summary."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [periodStart, periodEnd]);

  async function handleValidate() {
    if (!vatNumberInput.trim()) return;
    setValidating(true);
    try {
      const result = await validateVatNumber(vatNumberInput.trim());
      setValidation(result);
    } catch (err) {
      setValidation(null);
      setError(err instanceof ApiError ? err.message : "Couldn't validate VAT number.");
    } finally {
      setValidating(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">VAT</h1>
        <Link to="/vat/returns">
          <Button variant="secondary">VAT returns</Button>
        </Link>
      </div>

      <Card className="p-5 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-md">
          <Field label="Period start">
            <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </Field>
          <Field label="Period end">
            <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </Field>
        </div>
      </Card>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {!loading && !error && summary && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
          <Card>
            <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-1">Sales</h2>
            <p className="px-5 text-xs text-ink-muted mb-3">
              Net {formatMoney(summary.sales_total_net)} · VAT {formatMoney(summary.sales_total_vat)}
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-2 font-medium">Treatment</th>
                  <th className="px-5 py-2 font-medium text-right">Net</th>
                  <th className="px-5 py-2 font-medium text-right">VAT</th>
                </tr>
              </thead>
              <tbody>
                {summary.sales.map((row) => (
                  <tr key={row.treatment} className="border-b border-border last:border-0">
                    <td className="px-5 py-2 capitalize">{row.treatment}</td>
                    <td className="px-5 py-2 text-right font-mono-data">{formatMoney(row.net)}</td>
                    <td className="px-5 py-2 text-right font-mono-data">{formatMoney(row.vat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-1">Purchases</h2>
            <p className="px-5 text-xs text-ink-muted mb-3">
              Net {formatMoney(summary.purchases_total_net)} · VAT{" "}
              {formatMoney(summary.purchases_total_vat)}
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-2 font-medium">Treatment</th>
                  <th className="px-5 py-2 font-medium text-right">Net</th>
                  <th className="px-5 py-2 font-medium text-right">VAT</th>
                </tr>
              </thead>
              <tbody>
                {summary.purchases.map((row) => (
                  <tr key={row.treatment} className="border-b border-border last:border-0">
                    <td className="px-5 py-2 capitalize">{row.treatment}</td>
                    <td className="px-5 py-2 text-right font-mono-data">{formatMoney(row.net)}</td>
                    <td className="px-5 py-2 text-right font-mono-data">{formatMoney(row.vat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      <Card className="p-5">
        <h2 className="text-sm font-medium text-ink-muted mb-3">Validate a VAT number</h2>
        <div className="flex gap-2 max-w-sm">
          <Input
            placeholder="e.g. GB123456789"
            value={vatNumberInput}
            onChange={(e) => setVatNumberInput(e.target.value)}
          />
          <Button variant="secondary" onClick={handleValidate} disabled={validating}>
            {validating ? "Checking…" : "Validate"}
          </Button>
        </div>
        {validation && (
          <p className={`mt-3 text-sm ${validation.valid ? "text-positive" : "text-negative"}`}>
            {validation.valid ? "Valid" : "Invalid"} ({validation.format}) — {validation.message}
            {validation.valid && (
              <span className="ml-1 font-mono-data text-ink-muted">→ {validation.normalized}</span>
            )}
          </p>
        )}
      </Card>
    </div>
  );
}
