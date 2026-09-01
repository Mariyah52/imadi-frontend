import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { downloadFile } from "../../api/client";
import { getCustomerLedgerReport } from "../../api/reports";
import { voidPayment } from "../../api/invoices";
import type { CustomerLedgerReport } from "../../api/reports";
import { listCustomers } from "../../api/customers";
import type { Customer } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { formatMoney, monthStartISO, todayISO } from "../../lib/format";

export function CustomerLedgerReportPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [periodStart, setPeriodStart] = useState(monthStartISO());
  const [periodEnd, setPeriodEnd] = useState(todayISO());
  const [report, setReport] = useState<CustomerLedgerReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "excel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCustomers("", 1, 100).then((res) => setCustomers(res.items)).catch(() => {});
  }, []);

  async function handleVoid(paymentNumber: string) {
    const reason = window.prompt(`Reason for voiding ${paymentNumber}:`);
    if (reason === null || reason.trim() === "") return;
    const confirmed = window.confirm(`Void payment ${paymentNumber}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await voidPayment(paymentNumber, reason.trim());
      if (customerId) {
        const result = await getCustomerLedgerReport(customerId, periodStart, periodEnd);
        setReport(result);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't void this payment.");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getCustomerLedgerReport(customerId, periodStart, periodEnd);
      setReport(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load the customer ledger.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(format: "pdf" | "excel") {
    if (!customerId) return;
    setDownloading(format);
    setError(null);
    try {
      const ext = format === "pdf" ? "pdf" : "xlsx";
      const path = `/reports/customer-ledger?customer_id=${customerId}&period_start=${periodStart}&period_end=${periodEnd}&export=${format}`;
      await downloadFile(path, `customer-ledger.${ext}`);
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
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-1">Customer ledger</h1>
      <p className="text-sm text-ink-muted mb-6">
        Invoice and payment history with a running balance for one customer.
      </p>

      <Card className="p-5 mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
          <Field label="Customer">
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </select>
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

      {error && <p className="text-sm text-negative mb-4">{error}</p>}

      {report && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-4">
              <div>
                <span className="text-sm text-ink-muted">Opening balance</span>
                <div className="font-display text-lg font-semibold">
                  {formatMoney(report.opening_balance)}
                </div>
              </div>
              <div>
                <span className="text-sm text-ink-muted">Closing balance</span>
                <div className="font-display text-lg font-semibold">
                  {formatMoney(report.closing_balance)}
                </div>
              </div>
            </div>
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
          </div>

          <Card>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium text-right">Debit</th>
                  <th className="px-5 py-3 font-medium text-right">Credit</th>
                  <th className="px-5 py-3 font-medium text-right">Balance</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {report.lines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-6 text-center text-ink-muted">
                      No activity in this period.
                    </td>
                  </tr>
                ) : (
                  report.lines.map((l, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 text-ink-muted">{l.date}</td>
                      <td className="px-5 py-3 capitalize">{l.type}</td>
                      <td className="px-5 py-3 font-mono-data text-xs">{l.reference}</td>
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
                      <td className="px-5 py-3 text-right">
                        {l.type === "payment" && (
                          <button
                            type="button"
                            onClick={() => handleVoid(l.reference)}
                            className="text-xs text-negative hover:underline"
                          >
                            Void
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
