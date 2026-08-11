import { useState, type FormEvent } from "react";
import { createCustomer, addAddress } from "../../api/customers";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";

export function CreateCustomerModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [customerCode, setCustomerCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const customer = await createCustomer({
        customer_code: customerCode,
        company_name: companyName,
        email: email || undefined,
        phone: phone || undefined,
      });
      if (line1.trim() && city.trim() && postcode.trim()) {
        await addAddress(customer.id, {
          address_type: "billing",
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          city: city.trim(),
          postcode: postcode.trim(),
          country_code: "GB",
          is_default: true,
        });
      }
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the customer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 px-4 py-8 overflow-y-auto">
      <Card className="w-full max-w-md p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">New customer</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Customer code">
            <Input required value={customerCode} onChange={(e) => setCustomerCode(e.target.value)} />
          </Field>
          <Field label="Company name">
            <Input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <div className="border-t border-border pt-4 mt-1">
            <p className="text-xs text-ink-muted mb-3">
              Address (optional — leave blank to add later from the customer's page)
            </p>
            <div className="flex flex-col gap-4">
              <Field label="Address line 1">
                <Input value={line1} onChange={(e) => setLine1(e.target.value)} />
              </Field>
              <Field label="Address line 2">
                <Input value={line2} onChange={(e) => setLine2(e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </Field>
                <Field label="Postcode">
                  <Input value={postcode} onChange={(e) => setPostcode(e.target.value)} />
                </Field>
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create customer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
