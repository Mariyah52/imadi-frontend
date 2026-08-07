import { useState, type FormEvent } from "react";
import { updateCustomer } from "../../api/customers";
import { ApiError } from "../../api/client";
import type { CustomerProfile } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";

export function EditCustomerModal({
  customer,
  onClose,
  onSaved,
}: {
  customer: CustomerProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [companyName, setCompanyName] = useState(customer.company_name);
  const [email, setEmail] = useState(customer.email ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [vatNumber, setVatNumber] = useState(customer.vat_number ?? "");
  const [paymentTermsDays, setPaymentTermsDays] = useState(String(customer.payment_terms_days));
  const [isActive, setIsActive] = useState(customer.is_active);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateCustomer(customer.id, {
        company_name: companyName,
        email: email || undefined,
        phone: phone || undefined,
        vat_number: vatNumber || undefined,
        payment_terms_days: Number(paymentTermsDays),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Edit customer</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Company name">
            <Input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
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
