import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { downloadFile } from "../../api/client";
import { getCustomerAging, getSupplierAging } from "../../api/reports";
import type { AgingReport } from "../../api/reports";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { formatMoney, todayISO } from "../../lib/format";

export function AgingReportPage() {
  const [params] = useSearchParams();
  const type = params.get("type") === "supplier" ? "supplier" : "customer";
  const [asOf, setAsOf] = useState(todayISO());
  const [report, setReport] = useState<AgingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<"pdf" | "excel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const fetcher = type === "supplier" ? getSupplierAging : getCustomerAging;
    fetcher(asOf)
      .then(setReport)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the aging report."))
      .finally(() => setLoading(false));
  }, [asOf, type]);

  async function handleDownload(format: "pdf" | "excel") {
    setDownloading(format);
    setError(null);
    try {
      const ext = format === "pdf" ? "pdf" : "xlsx";
      const endpoint = type === "supplier" ? "supplier-aging" : "customer-aging";
      const path = `/reports/${endpoint}?as_of=${asOf}&export=${format}`;
      await downloadFile(path, `${endpoint}.${ext}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't download the report.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div>
      <Link to="/reports" className="text-sm text-navy-800 hover:underline">
        ← Reports
      </Link>
      <div className="mt-3 mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink capitalize">{type} aging</h1>
        {report && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={downloading !== null}
              onClick={() => handleDownload("pdf")}
            >
              {downloading === "pdf" ? "Downloading…" : "Download PDF"}
            </Button>
            <Button
              variant="secondary"
              disabled={downloading !== null}
              onClick={() => handleDownload("excel")}
            >
              {downloading === "excel" ? "Downloading…" : "Download Excel"}
            </Button>
          </div>
        )}
      </div>

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
                <th className="px-5 py-3 font-medium">{type === "supplier" ? "Supplier" : "Customer"}</th>
                <th className="px-5 py-3 font-medium text-right">Current</th>
                <th className="px-5 py-3 font-medium text-right">1-30</th>
                <th className="px-5 py-3 font-medium text-right">31-60</th>
                <th className="px-5 py-3 font-medium text-right">61-90</th>
                <th className="px-5 py-3 font-medium text-right">90+</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-ink-muted">
                    No outstanding balances.
                  </td>
                </tr>
              ) : (
                report.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">{row.customer_name ?? row.supplier_name}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{formatMoney(row.current)}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{formatMoney(row.days_1_30)}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{formatMoney(row.days_31_60)}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{formatMoney(row.days_61_90)}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{formatMoney(row.days_90_plus)}</td>
                    <td className="px-5 py-3 text-right font-mono-data font-medium">
                      {formatMoney(row.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {report.rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border font-medium">
                  <td className="px-5 py-3">Total</td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(report.totals.current)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(report.totals.days_1_30)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(report.totals.days_31_60)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(report.totals.days_61_90)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(report.totals.days_90_plus)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(report.grand_total)}
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
