import { useState, type FormEvent } from "react";
import { updateSupplier } from "../../api/suppliers";
import { ApiError } from "../../api/client";
import type { SupplierProfile } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";

export function EditSupplierModal({
  supplier,
  onClose,
  onSaved,
}: {
  supplier: SupplierProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [companyName, setCompanyName] = useState(supplier.company_name);
  const [contactName, setContactName] = useState(supplier.contact_name ?? "");
  const [email, setEmail] = useState(supplier.email ?? "");
  const [phone, setPhone] = useState(supplier.phone ?? "");
  const [vatNumber, setVatNumber] = useState(supplier.vat_number ?? "");
  const [paymentTermsDays, setPaymentTermsDays] = useState(String(supplier.payment_terms_days));
  const [bankIban, setBankIban] = useState(supplier.bank_account_iban ?? "");
  const [bankSortCode, setBankSortCode] = useState(supplier.bank_sort_code ?? "");
  const [isActive, setIsActive] = useState(supplier.is_active);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateSupplier(supplier.id, {
        company_name: companyName,
        contact_name: contactName || undefined,
        email: email || undefined,
        phone: phone || undefined,
        vat_number: vatNumber || undefined,
        payment_terms_days: Number(paymentTermsDays),
        bank_account_iban: bankIban || undefined,
        bank_sort_code: bankSortCode || undefined,
        is_active: isActive,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/40 px-4 py-8 overflow-y-auto">
      <Card className="w-full max-w-md p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Edit supplier</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Company name">
            <Input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </Field>
          <Field label="Contact name">
            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="VAT number">
            <Input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} />
          </Field>
          <Field label="Payment terms (days)">
            <Input
              type="number"
              min={0}
              max={365}
              value={paymentTermsDays}
              onChange={(e) => setPaymentTermsDays(e.target.value)}
            />
          </Field>
          <Field label="Bank IBAN">
            <Input value={bankIban} onChange={(e) => setBankIban(e.target.value)} />
          </Field>
          <Field label="Bank sort code">
            <Input value={bankSortCode} onChange={(e) => setBankSortCode(e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Active
          </label>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
