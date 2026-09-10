import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getGeneralLedgerReport } from "../../api/reports";
import type { GeneralLedgerReport } from "../../api/reports";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { AccountSelect } from "../accounting/AccountSelect";
import { formatMoney, monthStartISO, todayISO } from "../../lib/format";

export function GeneralLedgerReportPage() {
  const [accountId, setAccountId] = useState("");
  const [periodStart, setPeriodStart] = useState(monthStartISO());
  const [periodEnd, setPeriodEnd] = useState(todayISO());
  const [report, setReport] = useState<GeneralLedgerReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accountId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getGeneralLedgerReport(accountId.trim(), periodStart, periodEnd);
      setReport(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load the general ledger.");
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
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-1">General ledger</h1>
      <p className="text-sm text-ink-muted mb-6">Line-by-line activity for one account.</p>

      <Card className="p-5 mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
          <Field label="Account">
            <AccountSelect value={accountId} onChange={setAccountId} required />
          </Field>
          <Field label="Period start">
            <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </Field>
          <Field label="Period end">
            <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Loading…" : "Run report"}
          </Button>
        </form>
      </Card>

      {error && <p className="text-sm text-negative">{error}</p>}

      {report && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <Card className="p-5">
              <span className="text-sm text-ink-muted">
                {report.account_code} — {report.account_name}
              </span>
              <div className="mt-1 text-xs text-ink-muted">
                Opening {formatMoney(report.opening_balance)} · Closing{" "}
                {formatMoney(report.closing_balance)}
              </div>
            </Card>
          </div>
          <Card>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Entry</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium text-right">Debit</th>
                  <th className="px-5 py-3 font-medium text-right">Credit</th>
                  <th className="px-5 py-3 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {report.lines.map((l, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-ink-muted">{l.entry_date}</td>
                    <td className="px-5 py-3 font-mono-data text-xs">{l.entry_number}</td>
                    <td className="px-5 py-3">{l.description}</td>
                    <td className="px-5 py-3 text-right font-mono-data">
                      {Number(l.debit) > 0 ? formatMoney(l.debit) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-mono-data">
                      {Number(l.credit) > 0 ? formatMoney(l.credit) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-mono-data">
                      {formatMoney(l.running_balance)}
                    </td>
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
