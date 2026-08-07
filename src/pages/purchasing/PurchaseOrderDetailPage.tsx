import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import {
  approvePurchaseOrder,
  getPurchaseOrder,
  rejectPurchaseOrder,
  submitPurchaseOrder,
} from "../../api/purchasing";
import { getSupplierProfile } from "../../api/suppliers";
import type { PurchaseOrderFull } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../lib/format";
import { ReceiveGoodsModal } from "./ReceiveGoodsModal";
import { useAuth } from "../../auth/AuthContext";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-navy-100 text-ink-muted",
  submitted: "bg-amber-100 text-amber-600",
  approved: "bg-positive-bg text-positive",
  rejected: "bg-negative-bg text-negative",
  partially_received: "bg-amber-100 text-amber-600",
  received: "bg-positive-bg text-positive",
};

export function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();

  const [po, setPo] = useState<PurchaseOrderFull | null>(null);
  const [supplierName, setSupplierName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  function load() {
    if (!id) return;
    getPurchaseOrder(id)
      .then((p) => {
        setPo(p);
        return getSupplierProfile(p.supplier_id);
      })
      .then((s) => setSupplierName(s.company_name))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this purchase order."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleSubmit() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      await submitPurchaseOrder(id);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't submit the PO.");
    } finally {
      setBusy(false);
    }
  }

  async function handleApprove() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      await approvePurchaseOrder(id);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't approve the PO.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!id || !rejectReason.trim()) return;
    setBusy(true);
    setActionError(null);
    try {
      await rejectPurchaseOrder(id, rejectReason.trim());
      setShowRejectReason(false);
      setRejectReason("");
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't reject the PO.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (error) return <p className="text-sm text-negative">{error}</p>;
  if (!po || !id) return null;

  const canCreate = hasPermission("purchasing:create");
  const canApprove = hasPermission("purchasing:approve");
  const canReceive = hasPermission("purchasing:receive");

  return (
    <div>
      <Link to="/purchasing/orders" className="text-sm text-navy-800 hover:underline">
        ← Purchase orders
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink font-mono-data">{po.po_number}</h1>
          <p className="text-sm text-ink-muted mt-1">
            {supplierName ?? "…"} · Ordered {po.order_date}
            {po.expected_date && ` · Expected ${po.expected_date}`}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
            STATUS_TONE[po.status] ?? "bg-navy-100 text-ink-muted"
          }`}
        >
          {po.status.replace("_", " ")}
        </span>
      </div>

      {actionError && <p className="mb-4 text-sm text-negative">{actionError}</p>}
      {po.rejection_reason && (
        <p className="mb-4 text-sm text-negative">Rejected: {po.rejection_reason}</p>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {po.status === "draft" && canCreate && (
          <Button disabled={busy} onClick={handleSubmit}>
            Submit for approval
          </Button>
        )}
        {po.status === "submitted" && canApprove && (
          <>
            <Button disabled={busy} onClick={handleApprove}>
              Approve
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => setShowRejectReason(true)}>
              Reject
            </Button>
          </>
        )}
        {(po.status === "approved" || po.status === "partially_received") && canReceive && (
          <Button disabled={busy} onClick={() => setShowReceive(true)}>
            Receive goods
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Subtotal</span>
          <div className="mt-1 font-display text-lg font-semibold">
            {formatMoney(po.subtotal, po.currency)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">VAT</span>
          <div className="mt-1 font-display text-lg font-semibold">
            {formatMoney(po.vat_total, po.currency)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Total</span>
          <div className="mt-1 font-display text-lg font-semibold">
            {formatMoney(po.total, po.currency)}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">Line items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium text-right">Ordered</th>
              <th className="px-5 py-3 font-medium text-right">Received</th>
              <th className="px-5 py-3 font-medium text-right">Outstanding</th>
              <th className="px-5 py-3 font-medium text-right">Unit cost</th>
              <th className="px-5 py-3 font-medium text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {po.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3">{item.description}</td>
                <td className="px-5 py-3 text-right font-mono-data">{item.quantity_ordered}</td>
                <td className="px-5 py-3 text-right font-mono-data">{item.quantity_received}</td>
                <td className="px-5 py-3 text-right font-mono-data">{item.quantity_outstanding}</td>
                <td className="px-5 py-3 text-right font-mono-data">
                  {formatMoney(item.unit_cost, po.currency)}
                </td>
                <td className="px-5 py-3 text-right font-mono-data">
                  {formatMoney(item.line_total, po.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {po.notes && (
          <div className="border-t border-border p-5">
            <span className="text-sm text-ink-muted">Notes</span>
            <p className="mt-1 text-sm whitespace-pre-wrap">{po.notes}</p>
          </div>
        )}
      </Card>

      {showReceive && (
        <ReceiveGoodsModal
          poId={id}
          items={po.items}
          onClose={() => setShowReceive(false)}
          onDone={() => {
            setShowReceive(false);
            load();
          }}
        />
      )}
    </div>
  );
}
