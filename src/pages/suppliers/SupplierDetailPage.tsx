import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import {
  addSupplierNote,
  getSupplierProfile,
  listPurchaseHistory,
  listSupplierBills,
  listSupplierNotes,
} from "../../api/suppliers";
import type { Bill, PurchaseOrder, SupplierProfile } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { NotesPanel } from "../../components/shared/NotesPanel";
import { formatMoney } from "../../lib/format";
import { EditSupplierModal } from "./EditSupplierModal";
import { useAuth } from "../../auth/AuthContext";

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  function load() {
    if (!id) return;
    Promise.all([getSupplierProfile(id), listPurchaseHistory(id), listSupplierBills(id)])
      .then(([p, pos, b]) => {
        setProfile(p);
        setPurchaseOrders(pos);
        setBills(b);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this supplier."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (error) return <p className="text-sm text-negative">{error}</p>;
  if (!profile || !id) return null;

  return (
    <div>
      <Link to="/suppliers" className="text-sm text-navy-800 hover:underline">
        ← Suppliers
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{profile.company_name}</h1>
          <p className="font-mono-data text-xs text-ink-muted mt-1">{profile.supplier_code}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              profile.is_active ? "bg-positive-bg text-positive" : "bg-navy-100 text-ink-muted"
            }`}
          >
            {profile.is_active ? "Active" : "Inactive"}
          </span>
          {hasPermission("suppliers:edit") && (
            <Button variant="secondary" onClick={() => setShowEdit(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Outstanding balance</span>
          <div className="mt-1 font-display text-xl font-semibold text-negative">
            {formatMoney(profile.outstanding_balance, profile.currency)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Payment terms</span>
          <div className="mt-1 font-display text-xl font-semibold text-ink">
            {profile.payment_terms_days} days
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
        <Card className="p-5">
          <h2 className="text-sm font-medium text-ink-muted mb-3">Contact</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-ink-muted">Contact name</dt>
            <dd>{profile.contact_name ?? "—"}</dd>
            <dt className="text-ink-muted">Email</dt>
            <dd>{profile.email ?? "—"}</dd>
            <dt className="text-ink-muted">Phone</dt>
            <dd>{profile.phone ?? "—"}</dd>
            <dt className="text-ink-muted">VAT number</dt>
            <dd>{profile.vat_number ?? "—"}</dd>
          </dl>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-medium text-ink-muted mb-3">Bank details</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-ink-muted">IBAN</dt>
            <dd className="font-mono-data text-xs">{profile.bank_account_iban ?? "—"}</dd>
            <dt className="text-ink-muted">Sort code</dt>
            <dd className="font-mono-data text-xs">{profile.bank_sort_code ?? "—"}</dd>
          </dl>
        </Card>
      </div>

      <Card className="mb-6">
        <NotesPanel
          entityId={id}
          loadNotes={listSupplierNotes}
          createNote={addSupplierNote}
          canEditPermission="suppliers:edit"
        />
      </Card>

      <Card className="mb-6">
        <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">Purchase orders</h2>
        {purchaseOrders.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-ink-muted">No purchase orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">PO</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Ordered</th>
                <th className="px-5 py-3 font-medium">Expected</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-mono-data text-xs">{po.po_number}</td>
                  <td className="px-5 py-3 capitalize">{po.status}</td>
                  <td className="px-5 py-3 text-ink-muted">{po.order_date}</td>
                  <td className="px-5 py-3 text-ink-muted">{po.expected_date ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(po.total, profile.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">Bills</h2>
        {bills.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-ink-muted">No bills yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Bill</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
                <th className="px-5 py-3 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-mono-data text-xs">{b.bill_number}</td>
                  <td className="px-5 py-3 capitalize">{b.status}</td>
                  <td className="px-5 py-3 text-ink-muted">{b.due_date}</td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(b.total, profile.currency)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(b.balance, profile.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showEdit && (
        <EditSupplierModal
          supplier={profile}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            load();
          }}
        />
      )}
    </div>
  );
}
