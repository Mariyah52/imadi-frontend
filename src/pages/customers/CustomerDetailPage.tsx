import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { deleteCustomer, getCustomerProfile, listCustomerInvoices } from "../../api/customers";
import type { CustomerInvoice, CustomerProfile } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../lib/format";
import { EditCustomerModal } from "./EditCustomerModal";
import { ContactsPanel } from "./ContactsPanel";
import { AddressesPanel } from "./AddressesPanel";
import { NotesPanel } from "../../components/shared/NotesPanel";
import { addNote, listNotes } from "../../api/customers";
import { useAuth } from "../../auth/AuthContext";

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    if (!id) return;
    Promise.all([getCustomerProfile(id), listCustomerInvoices(id)])
      .then(([p, inv]) => {
        setProfile(p);
        setInvoices(inv);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this customer."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCustomer(id);
      navigate("/customers");
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Couldn't delete this customer.");
      setDeleting(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (error) return <p className="text-sm text-negative">{error}</p>;
  if (!profile || !id) return null;

  return (
    <div>
      <Link to="/customers" className="text-sm text-navy-800 hover:underline">
        ← Customers
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{profile.company_name}</h1>
          <p className="font-mono-data text-xs text-ink-muted mt-1">{profile.customer_code}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              profile.is_active ? "bg-positive-bg text-positive" : "bg-navy-100 text-ink-muted"
            }`}
          >
            {profile.is_active ? "Active" : "Inactive"}
          </span>
          {hasPermission("customers:edit") && (
            <Button variant="secondary" onClick={() => setShowEdit(true)}>
              Edit
            </Button>
          )}
          {hasPermission("customers:edit") && (
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <Card className="p-4 mb-6">
          <p className="text-sm text-ink mb-1">
            Delete <span className="font-medium">{profile.company_name}</span> permanently? This cannot be undone.
          </p>
          <p className="text-xs text-ink-muted mb-3">
            Blocked if this customer has an outstanding balance.
          </p>
          {deleteError && <p className="text-sm text-negative mb-3">{deleteError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button disabled={deleting} onClick={handleDelete}>
              Delete permanently
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Outstanding balance</span>
          <div className="mt-1 font-display text-xl font-semibold text-negative">
            {formatMoney(profile.outstanding_balance, profile.currency)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Available credit</span>
          <div className="mt-1 font-display text-xl font-semibold text-positive">
            {formatMoney(profile.available_credit, profile.currency)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Credit limit</span>
          <div className="mt-1 font-display text-xl font-semibold text-ink">
            {formatMoney(profile.credit_limit, profile.currency)}
          </div>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <h2 className="text-sm font-medium text-ink-muted mb-3">Contact</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-ink-muted">Email</dt>
          <dd>{profile.email ?? "—"}</dd>
          <dt className="text-ink-muted">Phone</dt>
          <dd>{profile.phone ?? "—"}</dd>
          <dt className="text-ink-muted">VAT number</dt>
          <dd>{profile.vat_number ?? "—"}</dd>
          <dt className="text-ink-muted">Payment terms</dt>
          <dd>{profile.payment_terms_days} days</dd>
        </dl>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
        <Card>
          <ContactsPanel customerId={id} />
        </Card>
        <Card>
          <AddressesPanel customerId={id} />
        </Card>
      </div>

      <Card className="mb-6">
        <NotesPanel
          entityId={id}
          loadNotes={listNotes}
          createNote={addNote}
          canEditPermission="customers:edit"
        />
      </Card>

      <Card>
        <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">Invoices</h2>
        {invoices.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-ink-muted">No invoices yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
                <th className="px-5 py-3 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-mono-data text-xs">{inv.invoice_number}</td>
                  <td className="px-5 py-3 capitalize">{inv.status}</td>
                  <td className="px-5 py-3 text-ink-muted">{inv.due_date}</td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(inv.total, profile.currency)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(inv.balance, profile.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showEdit && (
        <EditCustomerModal
          customer={profile}
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
