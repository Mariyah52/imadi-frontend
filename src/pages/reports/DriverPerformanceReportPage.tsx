import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getDriverPerformanceReport } from "../../api/reports";
import type { DriverPerformanceReport } from "../../api/reports";
import { Card } from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Field";
import { monthStartISO, todayISO } from "../../lib/format";

export function DriverPerformanceReportPage() {
  const [periodStart, setPeriodStart] = useState(monthStartISO());
  const [periodEnd, setPeriodEnd] = useState(todayISO());
  const [report, setReport] = useState<DriverPerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getDriverPerformanceReport(periodStart, periodEnd)
      .then(setReport)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the report."))
      .finally(() => setLoading(false));
  }, [periodStart, periodEnd]);

  return (
    <div>
      <Link to="/reports" className="text-sm text-navy-800 hover:underline">
        ← Reports
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">Driver performance</h1>

      <Card className="p-5 mb-6">
        <div className="grid grid-cols-2 gap-4 max-w-sm">
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

      {!loading && !error && report && (
        <Card>
          {report.drivers.length === 0 ? (
            <p className="p-6 text-sm text-ink-muted">No shipment activity in this period.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Driver</th>
                  <th className="px-5 py-3 font-medium text-right">Shipments</th>
                  <th className="px-5 py-3 font-medium text-right">Delivered</th>
                  <th className="px-5 py-3 font-medium text-right">Exceptions</th>
                  <th className="px-5 py-3 font-medium text-right">Cancelled</th>
                  <th className="px-5 py-3 font-medium text-right">On-time %</th>
                </tr>
              </thead>
              <tbody>
                {report.drivers.map((d) => (
                  <tr key={d.driver_id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">{d.driver_name}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{d.total_shipments}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{d.delivered_count}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{d.exception_count}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{d.cancelled_count}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{d.on_time_rate_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}
