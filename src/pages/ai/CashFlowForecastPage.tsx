import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getCashFlowForecast } from "../../api/ai";
import type { CashFlowForecast } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { formatMoney } from "../../lib/format";

export function CashFlowForecastPage() {
  const [weeksAhead, setWeeksAhead] = useState(8);
  const [forecast, setForecast] = useState<CashFlowForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getCashFlowForecast(weeksAhead)
      .then(setForecast)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the forecast."))
      .finally(() => setLoading(false));
  }, [weeksAhead]);

  return (
    <div>
      <Link to="/ai" className="text-sm text-navy-800 hover:underline">
        ← AI tools
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-1">Cash flow forecast</h1>
      <p className="text-sm text-ink-muted mb-6">
        A projection based on historical patterns, not a guarantee — treat this as a planning
        signal, not booked cash.
      </p>

      <div className="mb-6 flex gap-2">
        {[4, 8, 12, 26].map((w) => (
          <button
            key={w}
            onClick={() => setWeeksAhead(w)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              weeksAhead === w ? "bg-navy-800 text-white" : "bg-navy-100 text-ink-muted hover:bg-navy-100/70"
            }`}
          >
            {w} weeks
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {!loading && !error && forecast && (
        <>
          <Card className="p-5 mb-6 max-w-xs">
            <span className="text-sm text-ink-muted">Starting balance</span>
            <div className="mt-1 font-display text-xl font-semibold">
              {formatMoney(forecast.starting_balance)}
            </div>
          </Card>
          <Card>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Week</th>
                  <th className="px-5 py-3 font-medium text-right">Expected inflow</th>
                  <th className="px-5 py-3 font-medium text-right">Expected outflow</th>
                  <th className="px-5 py-3 font-medium text-right">Projected balance</th>
                </tr>
              </thead>
              <tbody>
                {forecast.weeks.map((w, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-ink-muted">
                      {w.week_start} → {w.week_end}
                    </td>
                    <td className="px-5 py-3 text-right font-mono-data text-positive">
                      {formatMoney(w.expected_inflow)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono-data text-negative">
                      {formatMoney(w.expected_outflow)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono-data font-medium">
                      {formatMoney(w.projected_balance)}
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
