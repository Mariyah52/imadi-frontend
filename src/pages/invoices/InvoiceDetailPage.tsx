import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { cancelInvoice, duplicateInvoice, getInvoice, postInvoice } from "../../api/invoices";
import { getCustomerProfile, listAddresses } from "../../api/customers";
import type { Address, Invoice } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../lib/format";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { InvoiceLetterhead, InvoiceBillTo, InvoicePaymentDetails } from "./InvoiceLetterhead";
import { useAuth } from "../../auth/AuthContext";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-navy-100 text-ink-muted",
  posted: "bg-amber-100 text-amber-600",
  partially_paid: "bg-amber-100 text-amber-600",
  paid: "bg-positive-bg text-positive",
  overdue: "bg-negative-bg text-negative",
  cancelled: "bg-navy-100 text-ink-muted",
};

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  function load() {
    if (!id) return;
    getInvoice(id)
      .then((inv) => {
        setInvoice(inv);
        return Promise.all([getCustomerProfile(inv.customer_id), listAddresses(inv.customer_id)]);
      })
      .then(([customer, addresses]) => {
        setCustomerName(customer.company_name);
        const billing = addresses.find((a) => a.address_type === "billing") ?? addresses[0] ?? null;
        setBillingAddress(billing);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this invoice."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handlePost() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      await postInvoice(id);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't post the invoice.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!id || !cancelReason.trim()) return;
    setBusy(true);
    setActionError(null);
    try {
      await cancelInvoice(id, cancelReason.trim());
      setShowCancelReason(false);
      setCancelReason("");
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't cancel the invoice.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDuplicate() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      const copy = await duplicateInvoice(id);
      navigate(`/invoices/${copy.id}`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't duplicate the invoice.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (error) return <p className="text-sm text-negative">{error}</p>;
  if (!invoice || !id) return null;

  const canEdit = hasPermission("invoices:edit");
  const canPost = hasPermission("invoices:post");
  const canCreate = hasPermission("invoices:create");
  const isDraft = invoice.status === "draft";
  const isCancellable = invoice.status !== "cancelled" && invoice.status !== "paid";

  return (
    <div>
      <Link to="/invoices" className="text-sm text-navy-800 hover:underline no-print">
        ← Invoices
      </Link>

      <div className="print:max-w-2xl print:mx-auto">
        <InvoiceLetterhead />

      <div className="mt-3 mb-6 flex items-start justify-between gap-6">
        <InvoiceBillTo customerName={customerName ?? "…"} address={billingAddress} />
        <div className="text-sm text-right shrink-0">
          <p>
            <span className="text-ink-muted">Invoice no: </span>
            <span className="font-medium font-mono-data">{invoice.invoice_number}</span>
          </p>
          <p>
            <span className="text-ink-muted">Invoice date: </span>
            <span className="font-medium">{invoice.issue_date}</span>
          </p>
          <p>
            <span className="text-ink-muted">Due date: </span>
            <span className="font-medium">{invoice.due_date}</span>
          </p>
          <span
            className={`inline-block mt-2 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
              STATUS_TONE[invoice.effective_status] ?? "bg-navy-100 text-ink-muted"
            }`}
          >
            {invoice.effective_status.replace("_", " ")}
          </span>
        </div>
      </div>

      {actionError && <p className="mb-4 text-sm text-negative">{actionError}</p>}

      <div className="mb-6 flex flex-wrap gap-2 no-print">
        {isDraft && canPost && (
          <Button disabled={busy} onClick={handlePost}>
            Post invoice
          </Button>
        )}
        {invoice.status !== "draft" && invoice.status !== "cancelled" && canEdit && (
          <Button variant="secondary" disabled={busy} onClick={() => setShowPayment(true)}>
            Record payment
          </Button>
        )}
        {canCreate && (
          <Button variant="secondary" disabled={busy} onClick={handleDuplicate}>
            Duplicate
          </Button>
        )}
        {isCancellable && canEdit && (
          <Button variant="secondary" disabled={busy} onClick={() => setShowCancelReason(true)}>
            Cancel invoice
          </Button>
        )}
        <Button variant="secondary" onClick={() => window.print()}>
          Print / Download PDF
        </Button>
      </div>

      {showCancelReason && (
        <Card className="p-4 mb-6 flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-ink-muted">
              Reason for cancellation
            </label>
            <input
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <Button variant="secondary" onClick={() => setShowCancelReason(false)}>
            Back
          </Button>
          <Button disabled={busy || !cancelReason.trim()} onClick={handleCancel}>
            Confirm cancel
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Subtotal</span>
          <div className="mt-1 font-display text-lg font-semibold">
            {formatMoney(invoice.subtotal, invoice.currency)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">VAT</span>
          <div className="mt-1 font-display text-lg font-semibold">
            {formatMoney(invoice.vat_total, invoice.currency)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Total</span>
          <div className="mt-1 font-display text-lg font-semibold">
            {formatMoney(invoice.total, invoice.currency)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Balance</span>
          <div className="mt-1 font-display text-lg font-semibold text-negative">
            {formatMoney(invoice.balance, invoice.currency)}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">Line items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium text-right">Qty</th>
              <th className="px-5 py-3 font-medium text-right">Unit price</th>
              <th className="px-5 py-3 font-medium text-right">VAT</th>
              <th className="px-5 py-3 font-medium text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3">{item.description}</td>
                <td className="px-5 py-3 text-right font-mono-data">{item.quantity}</td>
                <td className="px-5 py-3 text-right font-mono-data">
                  {formatMoney(item.unit_price, invoice.currency)}
                </td>
                <td className="px-5 py-3 text-right font-mono-data">
                  {formatMoney(item.vat_amount, invoice.currency)}
                </td>
                <td className="px-5 py-3 text-right font-mono-data">
                  {formatMoney(item.line_total, invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoice.notes && (
          <div className="border-t border-border p-5">
            <span className="text-sm text-ink-muted">Invoice period / notes</span>
            <p className="mt-1 text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </Card>

      <Card className="p-5 mt-6">
        <InvoicePaymentDetails invoiceNumber={invoice.invoice_number} />
      </Card>
      </div>

      {showPayment && (
        <RecordPaymentModal
          invoiceId={id}
          balance={invoice.balance}
          onClose={() => setShowPayment(false)}
          onRecorded={() => {
            setShowPayment(false);
            load();
          }}
        />
      )}
    </div>
  );
}
