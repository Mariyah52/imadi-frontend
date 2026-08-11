import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createInvoice } from "../../api/invoices";
import { ApiError } from "../../api/client";
import type { Customer, InvoiceItemCreateRequest, Product } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { CustomerPicker } from "./CustomerPicker";
import { ProductLineInput } from "./ProductLineInput";
import { todayISO } from "../../lib/format";

function emptyItem(): InvoiceItemCreateRequest {
  return { description: "", quantity: "1", unit_price: "0", discount_percent: "0", vat_treatment: "standard" };
}

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10));
  const [items, setItems] = useState<InvoiceItemCreateRequest[]>([emptyItem()]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateItem(index: number, patch: Partial<InvoiceItemCreateRequest>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function selectProductForItem(index: number, product: Product) {
    updateItem(index, {
      description: `${product.sku} — ${product.name}`,
      unit_price: product.selling_price,
      product_id: product.id,
    });
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const estimatedSubtotal = items.reduce((sum, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.unit_price) || 0;
    const discount = Number(it.discount_percent ?? 0) || 0;
    return sum + qty * price * (1 - discount / 100);
  }, 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!customer) {
      setError("Choose a customer first.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const invoice = await createInvoice({
        customer_id: customer.id,
        issue_date: issueDate,
        due_date: dueDate,
        items,
        notes: notes || undefined,
      });
      navigate(`/invoices/${invoice.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the invoice.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink mb-6">New invoice</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Customer">
              <CustomerPicker value={customer} onChange={setCustomer} />
            </Field>
            <Field label="Issue date">
              <Input type="date" required value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </Field>
            <Field label="Due date">
              <Input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink-muted">Line items</h2>
            <Button type="button" variant="ghost" onClick={() => setItems((prev) => [...prev, emptyItem()])}>
              Add line
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end border-b border-border pb-3 last:border-0">
                <div className="col-span-5">
                  <Field label={i === 0 ? "Description" : ""}>
                    <ProductLineInput
                      value={item.description}
                      onChange={(description) => updateItem(i, { description })}
                      onSelectProduct={(product) => selectProductForItem(i, product)}
                    />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label={i === 0 ? "Qty" : ""}>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      required
                      value={item.quantity}
                      onChange={(e) => updateItem(i, { quantity: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label={i === 0 ? "Unit price" : ""}>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      required
                      value={item.unit_price}
                      onChange={(e) => updateItem(i, { unit_price: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label={i === 0 ? "Discount %" : ""}>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={item.discount_percent}
                      onChange={(e) => updateItem(i, { discount_percent: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="col-span-1 flex justify-end pb-2">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-xs text-negative hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end text-sm">
            <span className="text-ink-muted mr-2">Estimated subtotal (excl. VAT):</span>
            <span className="font-mono-data font-medium">{estimatedSubtotal.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-right text-xs text-ink-muted">
            Final totals — including VAT — are calculated by the backend on submit.
          </p>
        </Card>

        <Card className="p-5">
          <Field label="Invoice period / notes (e.g. '18 Jul 26 Till 24 Jul 26')">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </Card>

        {error && <p className="text-sm text-negative">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create draft invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
