import { useEffect, useState, type FormEvent } from "react";
import { receiveGoods } from "../../api/purchasing";
import { listWarehouses } from "../../api/inventory";
import { ApiError } from "../../api/client";
import type { PurchaseOrderItem, Warehouse } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";

export function ReceiveGoodsModal({
  poId,
  items,
  onClose,
  onDone,
}: {
  poId: string;
  items: PurchaseOrderItem[];
  onClose: () => void;
  onDone: () => void;
}) {
  const outstandingItems = items.filter((i) => Number(i.quantity_outstanding) > 0);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [batchNumber, setBatchNumber] = useState("DEFAULT");
  const [quantities, setQuantities] = useState<Record<string, string>>(
    Object.fromEntries(outstandingItems.map((i) => [i.id, i.quantity_outstanding])),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listWarehouses()
      .then((ws) => {
        setWarehouses(ws);
        if (ws.length > 0) setWarehouseId(ws[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load warehouses."));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const lines = outstandingItems
        .map((i) => ({ po_item_id: i.id, quantity_received: quantities[i.id] }))
        .filter((l) => Number(l.quantity_received) > 0);
      if (lines.length === 0) {
        setError("Enter a quantity for at least one line.");
        setSubmitting(false);
        return;
      }
      await receiveGoods(poId, { warehouse_id: warehouseId, batch_number: batchNumber, lines });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't record the goods receipt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 px-4 py-8 overflow-y-auto">
      <Card className="w-full max-w-lg p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Receive goods</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Warehouse">
              <select
                required
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Batch number">
              <Input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
            </Field>
          </div>

          <div className="flex flex-col gap-2">
            {outstandingItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex-1">
                  <div>{item.description}</div>
                  <div className="text-xs text-ink-muted">
                    Outstanding: {item.quantity_outstanding}
                  </div>
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={quantities[item.id] ?? ""}
                    onChange={(e) => setQuantities((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  />
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !warehouseId}>
              {submitting ? "Recording…" : "Confirm receipt"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
