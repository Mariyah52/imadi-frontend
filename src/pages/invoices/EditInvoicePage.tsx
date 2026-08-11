import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getInvoice, updateInvoice } from "../../api/invoices";
import { ApiError } from "../../api/client";
import type { InvoiceItemCreateRequest, Product } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { ProductLineInput } from "./ProductLineInput";

function toItemRequest(item: {
  product_id: string | null;
  description: string;
  quantity: string;
  unit_price: string;
  discount_percent: string;
}): InvoiceItemCreateRequest {
  return {
    product_id: item.product_id ?? undefined,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_percent: item.discount_percent,
  };
}

export function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<InvoiceItemCreateRequest[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getInvoice(id)
      .then((inv) => {
        if (inv.status !== "draft") {
          setLoadError("Only draft invoices can be edited.");
          return;
        }
        setIssueDate(inv.issue_date);
        setDueDate(inv.due_date);
        setNotes(inv.notes ?? "");
        setItems(inv.items.map(toItemRequest));
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Couldn't load this invoice."))
      .finally(() => setLoading(false));
  }, [id]);

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

  function addLine() {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: "1", unit_price: "0", discount_percent: "0", vat_treatment: "standard" },
    ]);
  }

  const estimatedSubtotal = items.reduce((sum, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.unit_price) || 0;
    const discount = Number(it.discount_percent ?? 0) || 0;
    return sum + qty * price * (1 - discount / 100);
  }, 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setSubmitting(true);
    try {
      await updateInvoice(id, {
        issue_date: issueDate,
        due_date: dueDate,
        items,
        notes: notes || undefined,
      });
      navigate(`/invoices/${id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (loadError) return <p className="text-sm text-negative">{loadError}</p>;

  return (
    <div>
      <Link to={`/invoices/${id}`} className="text-sm text-navy-800 hover:underline">
        ← Back to invoice
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">Edit invoice</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <Button type="button" variant="ghost" onClick={addLine}>
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
            Final totals — including VAT — are recalculated by the backend on save.
          </p>
        </Card>

        <Card className="p-5">
          <Field label="Invoice period / notes">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </Card>

        {error && <p className="text-sm text-negative">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
