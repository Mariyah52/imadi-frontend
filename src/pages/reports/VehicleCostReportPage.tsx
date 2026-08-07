import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getVehicleCostReport } from "../../api/reports";
import type { VehicleCostReport } from "../../api/reports";
import { Card } from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Field";
import { formatMoney, monthStartISO, todayISO } from "../../lib/format";

export function VehicleCostReportPage() {
  const [periodStart, setPeriodStart] = useState(monthStartISO());
  const [periodEnd, setPeriodEnd] = useState(todayISO());
  const [report, setReport] = useState<VehicleCostReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getVehicleCostReport(periodStart, periodEnd)
      .then(setReport)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the report."))
      .finally(() => setLoading(false));
  }, [periodStart, periodEnd]);

  return (
    <div>
      <Link to="/reports" className="text-sm text-navy-800 hover:underline">
        ← Reports
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">Vehicle cost</h1>

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
          {report.vehicles.length === 0 ? (
            <p className="p-6 text-sm text-ink-muted">No vehicle activity in this period.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Registration</th>
                  <th className="px-5 py-3 font-medium text-right">Fuel cost</th>
                  <th className="px-5 py-3 font-medium text-right">Maintenance</th>
                  <th className="px-5 py-3 font-medium text-right">Total cost</th>
                  <th className="px-5 py-3 font-medium text-right">Distance (km)</th>
                  <th className="px-5 py-3 font-medium text-right">Cost/km</th>
                </tr>
              </thead>
              <tbody>
                {report.vehicles.map((v) => (
                  <tr key={v.vehicle_id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-mono-data text-xs">{v.registration}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{formatMoney(v.fuel_cost)}</td>
                    <td className="px-5 py-3 text-right font-mono-data">
                      {formatMoney(v.maintenance_cost)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono-data">{formatMoney(v.total_cost)}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{v.distance_km}</td>
                    <td className="px-5 py-3 text-right font-mono-data">
                      {v.cost_per_km ? formatMoney(v.cost_per_km) : "—"}
                    </td>
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
