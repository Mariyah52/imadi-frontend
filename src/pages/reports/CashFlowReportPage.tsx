import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getCashFlowReport } from "../../api/reports";
import type { CashFlowReport } from "../../api/reports";
import { listAccounts } from "../../api/accounting";
import type { Account } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { formatMoney, monthStartISO, todayISO } from "../../lib/format";

export function CashFlowReportPage() {
  const [assetAccounts, setAssetAccounts] = useState<Account[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(monthStartISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [report, setReport] = useState<CashFlowReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAccounts("asset", true)
      .then(setAssetAccounts)
      .catch(() => setAssetAccounts([]));
  }, []);

  function toggleAccount(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getCashFlowReport(selectedIds, startDate, endDate);
      setReport(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load the cash flow report.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link to="/reports" className="text-sm text-navy-800 hover:underline">
        ← Reports
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-1">Cash flow</h1>
      <p className="text-sm text-ink-muted mb-6">
        A simplified direct-method view — every posted journal line hitting the cash/bank accounts
        you select below, not a full indirect-method statement. Listed here are your asset-type
        accounts; pick whichever represent cash or bank balances.
      </p>

      <Card className="p-5 mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <span className="mb-2 block text-sm font-medium text-ink-muted">
              Cash/bank accounts
            </span>
            {assetAccounts.length === 0 ? (
              <p className="text-sm text-ink-muted">No asset accounts found in the chart of accounts.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {assetAccounts.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(a.id)}
                      onChange={() => toggleAccount(a.id)}
                      className="h-4 w-4 rounded border-border"
                    />
                    {a.account_code} — {a.name}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <Field label="Start date">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="End date">
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
          <Button type="submit" disabled={loading || selectedIds.length === 0} className="self-start">
            {loading ? "Loading…" : "Run report"}
          </Button>
        </form>
      </Card>

      {error && <p className="text-sm text-negative">{error}</p>}

      {report && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <span className="text-sm text-ink-muted">Opening balance</span>
              <div className="mt-1 font-display text-lg font-semibold">
                {formatMoney(report.opening_cash_balance)}
              </div>
            </Card>
            <Card className="p-5">
              <span className="text-sm text-ink-muted">Net movement</span>
              <div className="mt-1 font-display text-lg font-semibold">
                {formatMoney(report.net_movement)}
              </div>
            </Card>
            <Card className="p-5">
              <span className="text-sm text-ink-muted">Closing balance</span>
              <div className="mt-1 font-display text-lg font-semibold">
                {formatMoney(report.closing_cash_balance)}
              </div>
            </Card>
          </div>
          <Card className="p-5">
            <h2 className="text-sm font-medium text-ink-muted mb-3">By category</h2>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(report.categories).map(([cat, amount]) => (
                  <tr key={cat} className="border-b border-border last:border-0">
                    <td className="py-2">{cat}</td>
                    <td className="py-2 text-right font-mono-data">{formatMoney(amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
