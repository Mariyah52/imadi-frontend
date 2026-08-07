import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getBalanceSheetReport } from "../../api/reports";
import type { BalanceSheetLine, BalanceSheetReport } from "../../api/reports";
import { Card } from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Field";
import { formatMoney, todayISO } from "../../lib/format";

function Section({ title, lines, total }: { title: string; lines: BalanceSheetLine[]; total: string }) {
  return (
    <Card>
      <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">{title}</h2>
      <table className="w-full text-sm">
        <tbody>
          {lines.length === 0 ? (
            <tr>
              <td className="px-5 py-3 text-ink-muted">No activity</td>
            </tr>
          ) : (
            lines.map((l) => (
              <tr key={l.account_id} className="border-b border-border last:border-0">
                <td className="px-5 py-2">{l.account_name}</td>
                <td className="px-5 py-2 text-right font-mono-data">{formatMoney(l.amount)}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border font-medium">
            <td className="px-5 py-3">Total {title.toLowerCase()}</td>
            <td className="px-5 py-3 text-right font-mono-data">{formatMoney(total)}</td>
          </tr>
        </tfoot>
      </table>
    </Card>
  );
}

export function BalanceSheetReportPage() {
  const [asOf, setAsOf] = useState(todayISO());
  const [report, setReport] = useState<BalanceSheetReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getBalanceSheetReport(asOf)
      .then(setReport)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the report."))
      .finally(() => setLoading(false));
  }, [asOf]);

  return (
    <div>
      <Link to="/reports" className="text-sm text-navy-800 hover:underline">
        ← Reports
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">Balance sheet</h1>

      <Card className="p-5 mb-6 max-w-xs">
        <Field label="As of">
          <Input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
        </Field>
      </Card>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {!loading && !error && report && (
        <div className="flex flex-col gap-4">
          {!report.balances && (
            <p className="text-sm text-negative">
              Warning: assets don't equal liabilities + equity for this date — this usually means
              opening balances or a financial year close hasn't been set up yet.
            </p>
          )}
          <Section title="Assets" lines={report.assets} total={report.total_assets} />
          <Section title="Liabilities" lines={report.liabilities} total={report.total_liabilities} />
          <Section title="Equity" lines={report.equity} total={report.total_equity} />
          <Card className="p-5">
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Current period earnings</span>
              <span className="font-mono-data">{formatMoney(report.current_period_earnings)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2 font-medium">
              <span>Total equity + earnings</span>
              <span className="font-mono-data">{formatMoney(report.total_equity_and_earnings)}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
