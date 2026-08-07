import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createPurchaseOrder } from "../../api/purchasing";
import { ApiError } from "../../api/client";
import type { PurchaseOrderItemCreateRequest, Supplier } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { SupplierPicker } from "./SupplierPicker";
import { todayISO } from "../../lib/format";

function emptyItem(): PurchaseOrderItemCreateRequest {
  return { description: "", quantity_ordered: "1", unit_cost: "0", vat_treatment: "standard" };
}

export function CreatePurchaseOrderPage() {
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [orderDate, setOrderDate] = useState(todayISO());
  const [expectedDate, setExpectedDate] = useState("");
  const [items, setItems] = useState<PurchaseOrderItemCreateRequest[]>([emptyItem()]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateItem(index: number, patch: Partial<PurchaseOrderItemCreateRequest>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const estimatedSubtotal = items.reduce((sum, it) => {
    return sum + (Number(it.quantity_ordered) || 0) * (Number(it.unit_cost) || 0);
  }, 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supplier) {
      setError("Choose a supplier first.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const po = await createPurchaseOrder({
        supplier_id: supplier.id,
        order_date: orderDate,
        expected_date: expectedDate || undefined,
        items,
        notes: notes || undefined,
      });
      navigate(`/purchasing/orders/${po.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the purchase order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink mb-6">New purchase order</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Supplier">
              <SupplierPicker value={supplier} onChange={setSupplier} />
            </Field>
            <Field label="Order date">
              <Input type="date" required value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            </Field>
            <Field label="Expected date">
              <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
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
                <div className="col-span-6">
                  <Field label={i === 0 ? "Description" : ""}>
                    <Input
                      required
                      value={item.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })}
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
                      value={item.quantity_ordered}
                      onChange={(e) => updateItem(i, { quantity_ordered: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="col-span-3">
                  <Field label={i === 0 ? "Unit cost" : ""}>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      required
                      value={item.unit_cost}
                      onChange={(e) => updateItem(i, { unit_cost: e.target.value })}
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
        </Card>

        <Card className="p-5">
          <Field label="Notes">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </Card>

        {error && <p className="text-sm text-negative">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create draft PO"}
          </Button>
        </div>
      </form>
    </div>
  );
}
