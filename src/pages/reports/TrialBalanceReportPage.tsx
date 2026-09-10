import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getTrialBalanceReport } from "../../api/reports";
import type { TrialBalanceReport } from "../../api/reports";
import { Card } from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Field";
import { formatMoney, todayISO } from "../../lib/format";

export function TrialBalanceReportPage() {
  const [asOf, setAsOf] = useState(todayISO());
  const [report, setReport] = useState<TrialBalanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getTrialBalanceReport(asOf)
      .then(setReport)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the report."))
      .finally(() => setLoading(false));
  }, [asOf]);

  return (
    <div>
      <Link to="/reports" className="text-sm text-navy-800 hover:underline">
        ← Reports
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">Trial balance</h1>

      <Card className="p-5 mb-6 max-w-xs">
        <Field label="As of">
          <Input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
        </Field>
      </Card>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {!loading && !error && report && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Account</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium text-right">Debit</th>
                <th className="px-5 py-3 font-medium text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-ink-muted">
                    No account activity as of this date.
                  </td>
                </tr>
              ) : (
                report.rows.map((r) => (
                  <tr key={r.account_id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-mono-data text-xs">{r.account_code}</td>
                    <td className="px-5 py-3">{r.account_name}</td>
                    <td className="px-5 py-3 capitalize text-ink-muted">{r.account_type}</td>
                    <td className="px-5 py-3 text-right font-mono-data">
                      {Number(r.debit) > 0 ? formatMoney(r.debit) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-mono-data">
                      {Number(r.credit) > 0 ? formatMoney(r.credit) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {report.rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border font-medium">
                  <td className="px-5 py-3" colSpan={3}>
                    Total
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(report.total_debit)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(report.total_credit)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </Card>
      )}
    </div>
  );
}
