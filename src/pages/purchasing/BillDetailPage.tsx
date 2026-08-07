import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { approveBill, getBill, rejectBill, submitBill } from "../../api/purchasing";
import { getSupplierProfile } from "../../api/suppliers";
import type { BillFull } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../lib/format";
import { RecordBillPaymentModal } from "./RecordBillPaymentModal";
import { useAuth } from "../../auth/AuthContext";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-navy-100 text-ink-muted",
  submitted: "bg-amber-100 text-amber-600",
  approved: "bg-amber-100 text-amber-600",
  rejected: "bg-negative-bg text-negative",
  partially_paid: "bg-amber-100 text-amber-600",
  paid: "bg-positive-bg text-positive",
  overdue: "bg-negative-bg text-negative",
};

export function BillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();

  const [bill, setBill] = useState<BillFull | null>(null);
  const [supplierName, setSupplierName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  function load() {
    if (!id) return;
    getBill(id)
      .then((b) => {
        setBill(b);
        return getSupplierProfile(b.supplier_id);
      })
      .then((s) => setSupplierName(s.company_name))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this bill."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleSubmit() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      await submitBill(id);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't submit the bill.");
    } finally {
      setBusy(false);
    }
  }

  async function handleApprove() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      await approveBill(id);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't approve the bill.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!id || !rejectReason.trim()) return;
    setBusy(true);
    setActionError(null);
    try {
      await rejectBill(id, rejectReason.trim());
      setShowRejectReason(false);
      setRejectReason("");
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't reject the bill.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (error) return <p className="text-sm text-negative">{error}</p>;
  if (!bill || !id) return null;

  const canCreate = hasPermission("purchasing:create");
  const canApprove = hasPermission("purchasing:approve");

  return (
    <div>
      <Link to="/purchasing/bills" className="text-sm text-navy-800 hover:underline">
        ← Bills
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink font-mono-data">{bill.bill_number}</h1>
          <p className="text-sm text-ink-muted mt-1">
            {supplierName ?? "…"} · Billed {bill.bill_date} · Due {bill.due_date}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
            STATUS_TONE[bill.effective_status] ?? "bg-navy-100 text-ink-muted"
          }`}
        >
          {bill.effective_status.replace("_", " ")}
        </span>
      </div>

      {actionError && <p className="mb-4 text-sm text-negative">{actionError}</p>}
      {bill.rejection_reason && (
        <p className="mb-4 text-sm text-negative">Rejected: {bill.rejection_reason}</p>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {bill.status === "draft" && canCreate && (
          <Button disabled={busy} onClick={handleSubmit}>
            Submit for approval
          </Button>
        )}
        {bill.status === "submitted" && canApprove && (
          <>
            <Button disabled={busy} onClick={handleApprove}>
              Approve
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => setShowRejectReason(true)}>
              Reject
            </Button>
          </>
        )}
        {(bill.status === "approved" || bill.status === "partially_paid") && canCreate && (
          <Button disabled={busy} onClick={() => setShowPayment(true)}>
            Record payment
          </Button>
        )}
      </div>

      {showRejectReason && (
        <Card className="p-4 mb-6 flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-ink-muted">Reason for rejection</label>
            <input
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <Button variant="secondary" onClick={() => setShowRejectReason(false)}>
            Back
          </Button>
          <Button disabled={busy || !rejectReason.trim()} onClick={handleReject}>
            Confirm reject
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Subtotal</span>
          <div className="mt-1 font-display text-lg font-semibold">
            {formatMoney(bill.subtotal, bill.currency)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">VAT</span>
          <div className="mt-1 font-display text-lg font-semibold">
            {formatMoney(bill.vat_total, bill.currency)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Total</span>
          <div className="mt-1 font-display text-lg font-semibold">
            {formatMoney(bill.total, bill.currency)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Balance</span>
          <div className="mt-1 font-display text-lg font-semibold text-negative">
            {formatMoney(bill.balance, bill.currency)}
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
              <th className="px-5 py-3 font-medium text-right">Unit cost</th>
              <th className="px-5 py-3 font-medium text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3">{item.description}</td>
                <td className="px-5 py-3 text-right font-mono-data">{item.quantity}</td>
                <td className="px-5 py-3 text-right font-mono-data">
                  {formatMoney(item.unit_cost, bill.currency)}
                </td>
                <td className="px-5 py-3 text-right font-mono-data">
                  {formatMoney(item.line_total, bill.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bill.notes && (
          <div className="border-t border-border p-5">
            <span className="text-sm text-ink-muted">Notes</span>
            <p className="mt-1 text-sm whitespace-pre-wrap">{bill.notes}</p>
          </div>
        )}
      </Card>

      {showPayment && (
        <RecordBillPaymentModal
          billId={id}
          balance={bill.balance}
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
