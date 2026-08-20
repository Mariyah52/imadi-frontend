import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { ApiError } from "../api/client";
import { getCustomerAging, getProfitReport, getSalesReport } from "../api/reports";
import type { AgingReport, ProfitReport, SalesReport } from "../api/reports";
import { formatMoney, monthStartISO, todayISO } from "../lib/format";

function KpiCard({
  label,
  code,
  value,
  tone = "neutral",
}: {
  label: string;
  code: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const toneClass =
    tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-ink";
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-muted">{label}</span>
        <span className="font-mono-data text-[11px] text-ink-muted/70">{code}</span>
      </div>
      <div className={`mt-2 font-display text-2xl font-semibold ${toneClass}`}>{value}</div>
    </Card>
  );
}

export function DashboardPage() {
  const [profit, setProfit] = useState<ProfitReport | null>(null);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [aging, setAging] = useState<AgingReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = monthStartISO();
    const end = todayISO();
    Promise.all([getProfitReport(start, end), getSalesReport(start, end), getCustomerAging(end)])
      .then(([p, s, a]) => {
        setProfit(p);
        setSales(s);
        setAging(a);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the dashboard."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink mb-1">Dashboard</h1>
      <p className="text-sm text-ink-muted mb-6">Month to date, as of {todayISO()}</p>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Revenue (net)" code="FIN-01" value={sales ? formatMoney(sales.total_net) : "—"} />
          <KpiCard
            label="Net income"
            code="FIN-02"
            value={profit ? formatMoney(profit.net_income) : "—"}
            tone={profit && Number(profit.net_income) >= 0 ? "positive" : "negative"}
          />
          <KpiCard
            label="Gross margin"
            code="FIN-03"
            value={profit ? `${profit.gross_margin_percent}%` : "—"}
          />
          <KpiCard
            label="Outstanding (AR)"
            code="OPS-01"
            value={aging ? formatMoney(aging.grand_total) : "—"}
            tone="negative"
          />
        </div>
      )}
    </div>
  );
}
